import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { getConversations, Conversation } from "../../apis/conversation.api";
import {
  fetchConversationById,
  filterFetchConversations,
} from "../../services/conversation.service";
import { TypingLoader } from "../ui/typing";
import {
  getMessages,
  sendMessage,
  Message,
  SendMessagePayload,
} from "../../apis/message.api";
import {
  Send,
  MessageCircle,
  User,
  Search,
  MoreVertical,
  Store,
  Image as ImageIcon,
  X,
} from "lucide-react";
import {
  fetchMessagesByConversation,
  markMessageAsReadService,
} from "@/services/message.service";
import { useAuth } from "@/hooks/useAuth";
// Socket realtime removed
import { ChatSocketManager } from "@/services/chatSocket.service";

const AdminChatSupport: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsPage, setConversationsPage] = useState(1);
  const [conversationsHasMore, setConversationsHasMore] = useState(true);
  const [conversationsLoadingMore, setConversationsLoadingMore] =
    useState(false);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  // UI message type with local status for optimistic updates
  type UIMsg = Message & {
    _tempId?: string;
    _status?: "sending" | "sent" | "failed";
  };
  const [messages, setMessages] = useState<UIMsg[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<number, UIMsg[]>
  >({});
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  // Search flow (separate list when active)
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Conversation[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const conversationsContainerRef = useRef<HTMLDivElement>(null);
  const [pageByConversation, setPageByConversation] = useState<
    Record<number, number>
  >({});
  const [hasMoreByConversation, setHasMoreByConversation] = useState<
    Record<number, boolean>
  >({});
  const [loadingMoreByConversation, setLoadingMoreByConversation] = useState<
    Record<number, boolean>
  >({});
  const [isTypingByConversation, setIsTypingByConversation] = useState<
    Record<number, boolean>
  >({});
  const [unreadMessagesByConversation, setUnreadMessagesByConversation] =
    useState<Record<number, UIMsg[]>>({});
  const [timeUpdateTrigger, setTimeUpdateTrigger] = useState(0);
  const [presenceUpdateTrigger, setPresenceUpdateTrigger] = useState(0);

  // useEffect(() => {
  //   const response = fetchConversationById(29);
  //   console.log("Test fetchConversationById: ", response);
  // }, []);

  // Khởi tạo socket manager và join phòng cá nhân khi có user
  const chatSocketManagerRef = useRef<ChatSocketManager | null>(null);
  useEffect(() => {
    chatSocketManagerRef.current = new ChatSocketManager();
    return () => {
      try {
        chatSocketManagerRef.current?.disconnect();
      } finally {
        chatSocketManagerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    if (!chatSocketManagerRef.current) return;
    console.log("Connect socket: ", user.id, (user as any)?.role || "provider");
    chatSocketManagerRef.current.connect(
      user.id as any,
      (user as any)?.role || "provider"
    );
  }, [user]);

  // Lắng nghe tin nhắn đến qua socket và đồng bộ UI
  useEffect(() => {
    if (!chatSocketManagerRef.current) return;

    const handler = async (data: {
      conversationId: string;
      messageId: string;
      senderId: string;
      senderRole: "user" | "provider";
      text?: string;
      image_url?: string;
    }) => {
      const convId = Number(data.conversationId);
      try {
        // Tạo message mới từ data nhận được
        console.log("data message socket: ", data);
        const newMessage: UIMsg = {
          id: Number(data.messageId),
          conversation_id: convId,
          sender_id: Number(data.senderId),
          message_text: data.text || "",
          image_url: data.image_url || null,
          is_read: false,
          created_at: new Date().toISOString(),
          _status: "sent",
        };

        // Chỉ thêm message vào cache nếu conversation đã có tin nhắn
        const cachedMessages = messagesByConversation[convId];
        if (cachedMessages && cachedMessages.length > 0) {
          setMessagesByConversation((prev) => {
            const existingMessages = prev[convId] || [];
            return {
              ...prev,
              [convId]: [...existingMessages, newMessage],
            };
          });

          // Lưu tin nhắn chưa đọc vào danh sách riêng
          setUnreadMessagesByConversation((prev) => {
            const existingUnread = prev[convId] || [];
            return {
              ...prev,
              [convId]: [...existingUnread, newMessage],
            };
          });
        }

        // Nếu đang mở đúng hội thoại thì hiển thị ngay và đánh dấu đã đọc
        setSelectedConversation((prev) => {
          if (prev && prev.id === convId) {
            setMessages((currentMessages) => [...currentMessages, newMessage]);
            // Đánh dấu tin nhắn vừa nhận là đã đọc ngay lập tức
            markMessagesAsRead(
              [newMessage],
              convId,
              selectedConversation || undefined
            );
          }
          return prev;
        });

        // Cập nhật metadata conversation với message mới
        setConversations((prev) => {
          const existingConversation = prev.find((c) => c.id === convId);

          if (existingConversation) {
            // Nếu đã có, cập nhật và đưa lên đầu
            const updatedConversation = {
              ...existingConversation,
              last_message_text:
                newMessage.message_text ||
                existingConversation.last_message_text,
              last_message_at: newMessage.created_at,
              unread_count_provider:
                selectedConversation?.id === convId
                  ? 0
                  : (existingConversation.unread_count_provider || 0) + 1,
            };

            // Đưa conversation lên đầu danh sách
            return [
              updatedConversation,
              ...prev.filter((c) => c.id !== convId),
            ];
          } else {
            // Nếu chưa có, load conversation mới (async)
            loadConversationById(convId, newMessage).then((newConversation) => {
              if (newConversation) {
                setConversations((prev) => [newConversation, ...prev]);
              }
            });
            return prev;
          }
        });
      } catch (_) {
        // ignore
      }
    };

    chatSocketManagerRef.current.onReceiveMessage(handler);
    return () => {
      chatSocketManagerRef.current?.offReceiveMessage(handler);
    };
  }, [selectedConversation]);

  // Lắng nghe trạng thái presence (online/offline) và ghi vào conversation.partner_presence
  useEffect(() => {
    if (!chatSocketManagerRef.current) return;
    const handlePresence = (payload: {
      userId: string;
      role: "user" | "provider";
      online: boolean;
      lastOfflineAt?: string | null;
    }) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (
            payload.role === "user" &&
            String(c.user_id) === String(payload.userId)
          ) {
            return {
              ...c,
              partner_presence: {
                online: payload.online,
                lastOfflineAt: payload.lastOfflineAt,
              },
            } as any;
          }
          return c;
        })
      );
      setSelectedConversation((prev) => {
        if (!prev) return prev;
        if (
          payload.role === "user" &&
          String(prev.user_id) === String(payload.userId)
        ) {
          return {
            ...prev,
            partner_presence: {
              online: payload.online,
              lastOfflineAt: payload.lastOfflineAt,
            },
          } as any;
        }
        return prev;
      });
    };
    chatSocketManagerRef.current.onPresenceStatusChanged(handlePresence);
    return () => {
      chatSocketManagerRef.current?.offPresenceStatusChanged(handlePresence);
    };
  }, []);

  // Lắng nghe trạng thái đang nhập (typing)
  useEffect(() => {
    if (!chatSocketManagerRef.current) return;

    const handleTyping = (data: {
      conversationId: string;
      senderId: string;
      senderRole: "user" | "provider";
      isTyping: boolean;
    }) => {
      const convId = Number(data.conversationId);
      console.log("Received typing", convId, data.isTyping);
      // Chỉ quan tâm khi phía đối phương đang nhập
      setIsTypingByConversation((prev) => ({
        ...prev,
        [convId]: data.isTyping,
      }));
    };

    chatSocketManagerRef.current.onUserTyping(handleTyping);
    return () => {
      chatSocketManagerRef.current?.offUserTyping(handleTyping as any);
    };
  }, []);

  // Lắng nghe trạng thái tin nhắn đã đọc
  useEffect(() => {
    if (!chatSocketManagerRef.current) return;

    const handleMessageStatus = (data: {
      conversationId: string;
      messageId: string;
      readerId: string;
      readerRole: "user" | "provider";
    }) => {
      const convId = Number(data.conversationId);
      const msgId = Number(data.messageId);
      const readerId = Number(data.readerId);

      console.log("Received message read status:", data);

      // Chỉ cập nhật nếu người đọc không phải là mình (provider)
      if (user && String(readerId) !== String(user.id)) {
        // Cập nhật trạng thái tin nhắn trong cache
        setMessagesByConversation((prev) => {
          const conversationMessages = prev[convId];
          if (!conversationMessages) return prev;

          const updatedMessages = conversationMessages.map((msg) => {
            // Chỉ cập nhật tin nhắn của provider (tin nhắn mà provider gửi)
            if (
              msg.id === msgId &&
              msg.sender_id === selectedConversation?.provider_id
            ) {
              return { ...msg, is_read: true };
            }
            return msg;
          });

          return {
            ...prev,
            [convId]: updatedMessages,
          };
        });

        // Cập nhật trạng thái tin nhắn trong UI hiện tại
        if (selectedConversation?.id === convId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === msgId &&
              msg.sender_id === selectedConversation.provider_id
                ? { ...msg, is_read: true }
                : msg
            )
          );
        }
      }
    };

    chatSocketManagerRef.current.onMessageStatus(handleMessageStatus);
    return () => {
      chatSocketManagerRef.current?.offMessageStatus(handleMessageStatus);
    };
  }, [selectedConversation, user]);

  const waitForImagesInContainer = async (container: HTMLDivElement | null) => {
    if (!container) return;
    const images = Array.from(
      container.querySelectorAll("img")
    ) as HTMLImageElement[];
    const pending = images.filter((img) => !img.complete);
    if (pending.length === 0) return;
    await Promise.all(
      pending.map(
        (img) =>
          new Promise<void>((resolve) => {
            img.addEventListener("load", () => resolve(), { once: true });
            img.addEventListener("error", () => resolve(), { once: true });
          })
      )
    );
  };

  // Hàm helper để đánh dấu tin nhắn đã đọc
  const markMessagesAsRead = async (
    messages: UIMsg[],
    conversationId: number,
    conversation?: Conversation
  ) => {
    try {
      // Lọc ra các tin nhắn chưa đọc và không phải của provider hiện tại
      const unreadMessages = messages.filter(
        (msg) =>
          !msg.is_read && msg.sender_id !== selectedConversation?.provider_id
      );

      if (unreadMessages.length === 0) return;

      const messageIds = unreadMessages.map((msg) => msg.id);
      const markedCount = unreadMessages.length; // Số lượng tin nhắn đã đánh dấu

      // Gọi API để đánh dấu đã đọc
      await markMessageAsReadService(messageIds);
      console.log("unreadMessages: ", unreadMessages);

      // Emit socket cho từng tin nhắn
      if (chatSocketManagerRef.current) {
        // Sử dụng conversation được truyền vào hoặc selectedConversation
        const currentConversation = conversation || selectedConversation;
        const receiverId = (currentConversation as any)?.user_id;
        const receiverRole = "user";
        console.log("receiverId: ", receiverId);

        if (receiverId) {
          unreadMessages.forEach((msg) => {
            chatSocketManagerRef.current?.emitMessageRead({
              conversation_id: conversationId,
              message_id: msg.id,
              readerRole: "provider",
              receiverId,
              receiverRole,
            });
          });
        }
      }

      // Cập nhật UI để đánh dấu đã đọc
      setMessages((prev) =>
        prev.map((msg) =>
          messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
        )
      );

      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]:
          prev[conversationId]?.map((msg) =>
            messageIds.includes(msg.id) ? { ...msg, is_read: true } : msg
          ) || [],
      }));

      // Cập nhật unread_count_provider trong danh sách conversations
      setConversations((prev) =>
        prev.map((conv) => {
          console.log("markedCount: ", markedCount);
          if (conv.id === conversationId) {
            const currentUnreadCount = conv.unread_count_provider || 0;
            const newUnreadCount = Math.max(
              0,
              currentUnreadCount - markedCount
            );
            return {
              ...conv,
              unread_count_provider: newUnreadCount,
            };
          }
          return conv;
        })
      );

      // Xóa tin nhắn chưa đọc khỏi danh sách unreadMessagesByConversation
      setUnreadMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]:
          prev[conversationId]?.filter((msg) => !messageIds.includes(msg.id)) ||
          [],
      }));
    } catch (error) {
      console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    }
  };

  // Lấy danh sách cuộc trò chuyện
  const fetchConversations = async (
    page: number = 1,
    append: boolean = false
  ) => {
    try {
      setLoading(true);
      const response = await getConversations(page, 20);
      console.log("Conversations: ", response.data);
      setConversations((prev) =>
        append ? [...prev, ...response.data] : response.data
      );
      chatSocketManagerRef.current?.subscribePresence(
        response.data.map((conv) => ({
          userId: conv.user_id,
          role: "user",
        }))
      );
      setConversationsPage(page);
      const hasMore = !!response.pagination?.hasNextPage;
      setConversationsHasMore(hasMore);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách cuộc trò chuyện:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load conversation theo ID khi chưa có trong danh sách
  const loadConversationById = async (
    conversationId: number,
    newestMessage?: UIMsg
  ) => {
    try {
      const response = await fetchConversationById(conversationId);
      console.log("Loaded conversation by ID: ", response);
      chatSocketManagerRef.current?.subscribePresence([
        {
          userId: response.data.user_id,
          role: "provider",
        },
      ]);
      if (response.success && response.data) {
        const conversation = response.data;

        // Cập nhật metadata nếu có tin nhắn mới
        if (newestMessage) {
          conversation.last_message_text = newestMessage.message_text;
          conversation.last_message_at = newestMessage.created_at;
          conversation.unread_count_provider =
            selectedConversation?.id === conversationId ? 0 : 1;
        }

        return conversation;
      }
    } catch (error) {
      console.error("Lỗi khi load conversation theo ID:", error);
    }
    return null;
  };

  // Lấy tin nhắn của cuộc trò chuyện được chọn
  const fetchMessages = async (conversation: Conversation) => {
    // console.log("Fetching messages for conversation: ", conversation);
    try {
      // Nếu đã có cache, dùng cache và không gọi API
      const cached = messagesByConversation[conversation.id];
      if (cached && cached.length) {
        setMessages(cached);
        // Đánh dấu tin nhắn đã đọc cho cache
        // await markMessagesAsRead(
        //   cached,
        //   conversationId,
        //   selectedConversation || undefined
        // );
        return;
      }
      setMessagesLoading(true);
      const response = await fetchMessagesByConversation({
        conversation_id: conversation.id,
        page: 1,
        limit: 20,
      });
      console.log("Messages: ", response.data);
      // API trả mới -> cũ, cần đảo thành cũ -> mới để tin nhắn mới nhất nằm dưới
      const ordered: UIMsg[] = (response.data || [])
        .slice()
        .reverse() as UIMsg[];
      setMessages(ordered);
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversation.id]: ordered,
      }));
      setPageByConversation((prev) => ({ ...prev, [conversation.id]: 1 }));
      const hasMore =
        !!(response as any)?.pagination?.hasNextPage ||
        response.data?.length >= 20;
      setHasMoreByConversation((prev) => ({
        ...prev,
        [conversation.id]: hasMore,
      }));

      // Đánh dấu tin nhắn đã đọc sau khi load xong
      await markMessagesAsRead(ordered, conversation.id, conversation);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadMoreOlderMessages = async (conversationId: number) => {
    try {
      if (loadingMoreByConversation[conversationId]) return;
      if (!hasMoreByConversation[conversationId]) return;

      const container = messagesContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;

      setLoadingMoreByConversation((prev) => ({
        ...prev,
        [conversationId]: true,
      }));
      // Tính page dựa theo số lượng tin nhắn hiện có (bội của 20)
      const PAGE_UNIT = 20;
      const currentCount = (messagesByConversation[conversationId] || [])
        .length;
      const currentPages = Math.floor(currentCount / PAGE_UNIT);
      const nextPage = currentPages + 1;

      const response = await getMessages(conversationId, nextPage, PAGE_UNIT);
      const olderOrdered: UIMsg[] = (response.data || [])
        .slice()
        .reverse() as UIMsg[];

      setMessages((prev) => {
        // Cắt phần dư của danh sách hiện tại để là bội số của 20 trước khi prepend
        const trimmedPrev = prev.slice(
          0,
          Math.floor(prev.length / PAGE_UNIT) * PAGE_UNIT
        );
        const updated = [...olderOrdered, ...trimmedPrev];
        setMessagesByConversation((map) => ({
          ...map,
          [conversationId]: updated,
        }));
        return updated;
      });

      setPageByConversation((prev) => ({
        ...prev,
        [conversationId]: nextPage,
      }));
      const hasMore =
        !!(response as any)?.pagination?.hasNextPage ||
        response.data?.length >= 20;
      setHasMoreByConversation((prev) => ({
        ...prev,
        [conversationId]: hasMore,
      }));

      // Đánh dấu tin nhắn đã đọc cho các tin nhắn cũ vừa load
      await markMessagesAsRead(
        olderOrdered,
        conversationId,
        selectedConversation || undefined
      );

      // giữ vị trí cuộn sau khi prepend: double rAF + chờ ảnh render xong
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          (async () => {
            await waitForImagesInContainer(messagesContainerRef.current);
            const el = messagesContainerRef.current;
            if (el) {
              const newScrollHeight = el.scrollHeight;
              el.scrollTop = newScrollHeight - prevScrollHeight;
            }
          })();
        });
      });
    } catch (error) {
      console.error("Lỗi khi tải thêm tin nhắn:", error);
    } finally {
      setLoadingMoreByConversation((prev) => ({
        ...prev,
        [conversationId]: false,
      }));
    }
  };

  // Gửi tin nhắn mới
  const handleSendMessage = async () => {
    if (
      (!newMessage.trim() && !selectedImage) ||
      !selectedConversation ||
      sendingMessage
    )
      return;

    try {
      setSendingMessage(true);

      // 1) Tạo tin nhắn tạm (optimistic UI)
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: UIMsg = {
        // id tạm thời (âm) để tránh trùng với id thật từ server
        id: -Date.now(),
        conversation_id: selectedConversation.id,
        sender_id: selectedConversation.provider_id as unknown as number,
        message_text: newMessage.trim(),
        image_url: imagePreviewUrl || null,
        is_read: false,
        created_at: new Date().toISOString(),
        _tempId: tempId,
        _status: "sending" as const,
      } as unknown as UIMsg;

      setMessages((prev) => {
        const updated = [...prev, optimisticMsg];
        setMessagesByConversation((m) => ({
          ...m,
          [selectedConversation.id]: updated,
        }));
        // gắn messages vào conversation hiện tại để đồng bộ nhanh danh sách
        setConversations((list) =>
          list.map((c) =>
            c.id === selectedConversation.id
              ? { ...(c as any), messages: updated }
              : c
          )
        );
        return updated;
      });
      setNewMessage("");

      const payload: SendMessagePayload = {} as any;
      if (newMessage.trim()) payload.message_text = newMessage.trim();
      if (selectedImage) payload.image = selectedImage as any;
      const conversationId = selectedConversation.id;
      console.log("Conversation ID: ", conversationId);
      payload.conversation_id = conversationId;
      const response = await sendMessage(payload);

      // 2) Thay thế tin nhắn tạm bằng tin nhắn thật và cập nhật trạng thái 'sent'
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m._tempId === tempId
            ? { ...(response.data as UIMsg), _status: "sent" as const }
            : m
        );
        setMessagesByConversation((m) => ({
          ...m,
          [selectedConversation.id]: updated,
        }));
        setConversations((list) =>
          list.map((c) =>
            c.id === selectedConversation.id
              ? { ...(c as any), messages: updated }
              : c
          )
        );
        return updated;
      });

      // Emit socket event đến conversation room
      console.log("Emitting socket message", selectedConversation);
      try {
        const senderId = (selectedConversation as any)?.provider_id;
        const receiverId = (selectedConversation as any)?.user_id;
        if (chatSocketManagerRef.current && senderId && receiverId) {
          chatSocketManagerRef.current.emitSendMessage({
            conversationId: selectedConversation.id,
            messageId: (response.data as any)?.id,
            senderId,
            senderRole: "provider",
            receiverId,
            receiverRole: "user",
            text: response.data.message_text || newMessage || "",
            image_url: response.data.image_url || undefined,
          });
        }
        console.log("Emitted socket message");
      } catch (_) {}

      // Cập nhật metadata cuộc trò chuyện cục bộ, không reload toàn bộ
      setConversations((prev) => {
        const updatedList = prev.map((c) => {
          if (c.id !== selectedConversation.id) return c;
          return {
            ...c,
            last_message_text: response.data.message_text ?? "",
            last_message_at: response.data.created_at,
          } as any;
        });
        const moved = updatedList.find((c) => c.id === selectedConversation.id);
        if (!moved) {
          const newConv = {
            ...(selectedConversation as any),
            last_message_text: response.data.message_text ?? "",
            last_message_at: response.data.created_at,
          } as any;
          // Add to head and drop the last to keep list size constant
          const withoutLast = updatedList.slice(
            0,
            Math.max(0, updatedList.length - 1)
          );
          return [newConv, ...withoutLast];
        }
        return [
          moved,
          ...updatedList.filter((c) => c.id !== selectedConversation.id),
        ];
      });

      // Exit search mode after sending
      setIsSearching(false);
      setSearchResults([]);
      setSearchLoading(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error);
      // Đánh dấu tin nhắn tạm thất bại nếu có
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m._status === "sending" ? { ...m, _status: "failed" as const } : m
        );
        if (selectedConversation) {
          setMessagesByConversation((m) => ({
            ...m,
            [selectedConversation.id]: updated,
          }));
        }
        return updated;
      });
    } finally {
      setSendingMessage(false);
      // Clear input image sau khi gửi thành công
      if (selectedImage) {
        setSelectedImage(null);
        setImagePreviewUrl("");
      }
    }
  };

  // Xử lý khi chọn cuộc trò chuyện
  const handleSelectConversation = async (conversation: Conversation) => {
    // Nếu chọn lại cùng hội thoại thì bỏ qua
    if (selectedConversation?.id === conversation.id) return;

    // Socket realtime removed

    setSelectedConversation(conversation);

    // Đánh dấu tất cả tin nhắn chưa đọc của conversation này
    const unreadMessages = unreadMessagesByConversation[conversation.id] || [];
    if (unreadMessages.length > 0) {
      await markMessagesAsRead(unreadMessages, conversation.id, conversation);
      // Xóa tin nhắn chưa đọc sau khi đã đánh dấu
      setUnreadMessagesByConversation((prev) => ({
        ...prev,
        [conversation.id]: [],
      }));
    }

    // Nếu conversation đã có messages kèm theo, dùng trực tiếp và cache
    const inlineMessages = (conversation as any)?.messages as
      | Message[]
      | undefined;
    if (inlineMessages && inlineMessages.length) {
      setMessages([...inlineMessages]);
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversation.id]: [...inlineMessages],
      }));
      requestAnimationFrame(() => {
        scrollToBottom();
        setTimeout(scrollToBottom, 120);
        setTimeout(scrollToBottom, 300);
      });
      return;
    }
    // Nếu có cache thì set ngay, nếu không thì fetch
    const cached = messagesByConversation[conversation.id];
    if (cached && cached.length) {
      // clone để kích hoạt render và effect
      setMessages([...cached]);
      // đảm bảo kéo xuống đáy
      requestAnimationFrame(() => {
        scrollToBottom();
        setTimeout(scrollToBottom, 120);
        setTimeout(scrollToBottom, 300);
      });
      return;
    }
    fetchMessages(conversation);
  };

  // Khi đổi hội thoại, đảm bảo auto scroll xuống đáy sau khi render
  useEffect(() => {
    if (!selectedConversation) return;
    requestAnimationFrame(() => {
      scrollToBottom();
      setTimeout(scrollToBottom, 120);
      setTimeout(scrollToBottom, 300);
    });
  }, [selectedConversation]);

  // Socket realtime removed

  // Socket realtime removed

  // Cuộn xuống cuối danh sách tin nhắn
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  };

  // Xử lý phím Enter để gửi tin nhắn
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format thời gian - chỉ hiển thị giờ
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Format thời gian ngắn gọn theo kiểu tương đối: "Vừa xong", "X phút trước", "X giờ trước", "X ngày trước", hoặc dd/MM
  const formatShortTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return "Vừa xong";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Format thời gian tương đối cho lastOfflineAt
  const formatRelativeTime = (dateString: string) => {
    if (!dateString) return "Không hoạt động";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return "Vừa offline";
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  useEffect(() => {
    fetchConversations(1, false);
  }, []);

  // Cập nhật thời gian mỗi phút
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdateTrigger((prev) => prev + 1);
    }, 60000); // 60000ms = 1 phút

    return () => clearInterval(interval);
  }, []);

  // Cập nhật trạng thái hoạt động mỗi phút
  useEffect(() => {
    const interval = setInterval(() => {
      setPresenceUpdateTrigger((prev) => prev + 1);
    }, 60000); // 60000ms = 1 phút

    return () => clearInterval(interval);
  }, []);

  const loadMoreConversations = async () => {
    try {
      if (conversationsLoadingMore) return;
      if (!conversationsHasMore) return;
      if (searchQuery.trim()) return; // bỏ qua khi đang tìm kiếm

      const container = conversationsContainerRef.current;
      const prevScrollTop = container?.scrollTop || 0;

      setConversationsLoadingMore(true);
      // Tính page dựa trên độ dài danh sách hiện tại (bội của 20)
      const PAGE_UNIT = 20;
      const currentPages = Math.floor((conversations?.length || 0) / PAGE_UNIT);
      const nextPage = currentPages + 1;

      // Gọi API lấy trang tiếp theo
      const response = await getConversations(nextPage, PAGE_UNIT);

      // Cắt phần dư ở cuối trước khi nối để tránh trùng
      setConversations((prev) => {
        const length = prev.length || 0;
        const trimmed = prev.slice(
          0,
          Math.floor(length / PAGE_UNIT) * PAGE_UNIT
        );
        return [...trimmed, ...(response.data || [])];
      });

      // Cập nhật phân trang/hasMore
      setConversationsPage(nextPage);
      const hasMore = !!response.pagination?.hasNextPage;
      setConversationsHasMore(hasMore);

      // Đăng ký presence cho batch mới
      chatSocketManagerRef.current?.subscribePresence(
        (response.data || []).map((conv) => ({
          userId: conv.user_id,
          role: "provider",
        }))
      );

      // Giữ nguyên khoảng cách từ top sau khi load thêm conversations
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = prevScrollTop;
        }
      });
    } catch (error) {
      console.error("Lỗi khi tải thêm cuộc trò chuyện:", error);
    } finally {
      setConversationsLoadingMore(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto scroll to bottom when component mounts or conversation changes
  useEffect(() => {
    if (selectedConversation) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedConversation]);

  const getDisplayName = (c: Conversation) => {
    const userProfile =
      (c as any)?.user?.user_profile || (c as any)?.user_profile;
    const providerProfile =
      (c as any)?.provider?.provider_profile || (c as any)?.provider_profile;
    const userName = userProfile
      ? `${userProfile.first_name || ""} ${userProfile.last_name || ""}`.trim()
      : "";
    const providerName = providerProfile?.company_name || "";
    // Ưu tiên tên user nếu có, nếu không thì tên provider
    return (
      userName ||
      providerName ||
      `User ${
        c.user_id ||
        (c as any)?.user?.id ||
        c.provider_id ||
        (c as any)?.provider?.id
      }`
    );
  };

  const filteredConversations = conversations.filter((c) => {
    const name = getDisplayName(c);
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Socket realtime removed

  return (
    <div className="flex h-[calc(100vh-64px)] min-h-[600px] p-6 gap-4">
      {/* Danh sách cuộc trò chuyện */}
      <Card className="w-1/3 min-w-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-gray-700" />
            <span className="text-gray-900">Tin Nhắn Của Tôi</span>
            {/* Socket realtime removed */}
          </CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={async (e) => {
                if (e.key !== "Enter") return;
                const keyword = searchQuery.trim();
                try {
                  if (!keyword) {
                    setIsSearching(false);
                    setSearchResults([]);
                    return;
                  }
                  setIsSearching(true);
                  setSearchLoading(true);
                  const res = await filterFetchConversations(
                    1,
                    20,
                    keyword as any
                  );
                  setSearchResults(res.data || []);
                } catch (_) {
                } finally {
                  setSearchLoading(false);
                }
              }}
              placeholder="Tìm kiếm khách hàng..."
              className="pl-9 pr-16 text-sm"
            />
            {isSearching && (
              <button
                type="button"
                onClick={() => {
                  setIsSearching(false);
                  setSearchResults([]);
                  setSearchLoading(false);
                  setSearchQuery("");
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-600 hover:text-gray-900 px-2 py-0.5 rounded"
                title="Thoát tìm kiếm"
                aria-label="Thoát tìm kiếm"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div
            ref={conversationsContainerRef}
            className="max-h-[calc(100vh-300px)] overflow-y-auto"
            onScroll={(e) => {
              const el = e.currentTarget;
              if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
                loadMoreConversations();
              }
            }}
          >
            {(isSearching ? searchLoading : loading) ? (
              <div className="p-4 text-center text-gray-500">Đang tải...</div>
            ) : (isSearching ? searchResults : filteredConversations).length ===
              0 ? (
              <div className="p-4 text-center text-gray-500">
                Chưa có cuộc trò chuyện nào
              </div>
            ) : (
              (isSearching ? searchResults : filteredConversations).map(
                (conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => handleSelectConversation(conversation)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? "bg-gray-50 border-l-4 border-l-gray-900"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {conversation.user?.avatar != null ? (
                          <img
                            src={conversation.user?.avatar}
                            // src={conversation.user?.avatar}
                            alt="avatar"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                            conversation.partner_presence?.online
                              ? "bg-gray-500"
                              : "bg-gray-300"
                          }`}
                          title={
                            conversation.partner_presence?.online
                              ? "Đang hoạt động"
                              : "Ngoại tuyến"
                          }
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-gray-900 truncate">
                            {conversation.user?.first_name +
                              " " +
                              conversation.user?.last_name}
                          </span>
                          <span
                            className="text-xs text-gray-500 ml-2"
                            key={`time-${conversation.id}-${timeUpdateTrigger}`}
                          >
                            {formatShortTime(conversation.last_message_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 truncate">
                            {conversation.last_message_text}
                          </p>
                          {conversation.unread_count_provider > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full font-semibold">
                              {conversation.unread_count_provider}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
            {conversationsLoadingMore && (
              <div className="p-3 text-center text-gray-500">
                Đang tải thêm...
              </div>
            )}

            {/* Socket realtime removed */}
          </div>
        </CardContent>
      </Card>

      {/* Khu vực chat */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header cuộc trò chuyện */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {(selectedConversation as any)?.user?.avatar ? (
                      <img
                        src={(selectedConversation as any).user.avatar}
                        alt="avatar"
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                        selectedConversation?.partner_presence?.online
                          ? "bg-gray-500"
                          : "bg-gray-300"
                      }`}
                      title={
                        selectedConversation?.partner_presence?.online
                          ? "Đang hoạt động"
                          : "Ngoại tuyến"
                      }
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {selectedConversation.user?.first_name +
                        " " +
                        selectedConversation.user?.last_name}
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        Khách hàng
                      </span>
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <span
                        className="text-gray-600"
                        key={`presence-${presenceUpdateTrigger}`}
                      >
                        {selectedConversation?.partner_presence?.online
                          ? "Đang hoạt động"
                          : selectedConversation?.partner_presence
                              ?.lastOfflineAt
                          ? formatRelativeTime(
                              selectedConversation.partner_presence
                                .lastOfflineAt
                            )
                          : "Không hoạt động"}
                      </span>

                      <span className="text-gray-400">•</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </Button>
              </div>
            </CardHeader>

            {/* Danh sách tin nhắn */}
            <CardContent className="flex-1 p-0 overflow-hidden">
              <div
                ref={messagesContainerRef}
                className="h-full max-h-[calc(100vh-55px)] overflow-y-auto p-4 space-y-4"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  if (!selectedConversation) return;
                  const convId = selectedConversation.id;
                  if (el.scrollTop <= 0) {
                    loadMoreOlderMessages(convId);
                  }
                }}
              >
                {messagesLoading ? (
                  <div className="text-center text-gray-500">
                    Đang tải tin nhắn...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Chưa có tin nhắn nào
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex flex-col ${
                        message.sender_id === selectedConversation.provider_id
                          ? "items-end"
                          : "items-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl overflow-hidden border ${
                          message.sender_id === selectedConversation.provider_id
                            ? "border-gray-900"
                            : "border-gray-300"
                        }`}
                      >
                        {message.image_url && (
                          <img
                            src={message.image_url}
                            alt="Tin nhắn hình ảnh"
                            className="max-w-[260px] max-h-[240px] w-full object-cover block"
                          />
                        )}
                        {message.message_text && (
                          <div className={`bg-white text-gray-900 px-4 py-2.5`}>
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                              {message.message_text}
                            </p>
                          </div>
                        )}
                      </div>
                      <div
                        className={`flex items-center gap-2 mt-1 ${
                          message.sender_id === selectedConversation.provider_id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {(message as any)._status === "sending" ? (
                          <span className="text-[11px] text-gray-400 italic">
                            Đang gửi...
                          </span>
                        ) : (message as any)._status === "failed" ? (
                          <span className="text-[11px] text-red-500">
                            Gửi thất bại
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <span
                              className="text-[11px] text-gray-500"
                              key={`msg-time-${message.id}-${timeUpdateTrigger}`}
                            >
                              {formatTime(message.created_at)}
                            </span>
                            {/* Chỉ hiển thị dấu tích cho tin nhắn của provider */}
                            {message.sender_id ===
                              selectedConversation.provider_id && (
                              <div className="flex">
                                {message.is_read ? (
                                  // 2 dấu tích xanh kiểu stroke khi đã đọc
                                  <div className="flex">
                                    <svg
                                      className="w-3 h-3 text-gray-400"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M5 12l4 4L19 6" />
                                    </svg>
                                    <svg
                                      className="w-3 h-3 text-gray-400 ml-[-8px]"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <path d="M7 14l3 3L21 6" />
                                    </svg>
                                  </div>
                                ) : (
                                  // 1 dấu tích xám kiểu stroke khi chưa đọc
                                  <svg
                                    className="w-3 h-3 text-gray-400"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M5 12l4 4L19 6" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            {selectedConversation &&
              isTypingByConversation[selectedConversation.id] && (
                <TypingLoader isAdmin={true} />
              )}

            {/* Form gửi tin nhắn */}
            <div className="p-4 border-t">
              {/* Preview hình ảnh nếu có */}
              {imagePreviewUrl && (
                <div className="mb-3 relative inline-block">
                  <div className="w-20 h-20 rounded-xl overflow-hidden ring-1 ring-gray-200 shadow-sm">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreviewUrl("");
                    }}
                    className="absolute -top-2 -right-2 bg-white text-gray-700 hover:text-red-600 ring-1 ring-gray-200 rounded-full p-1 shadow"
                    title="Xóa hình ảnh"
                    aria-label="Xóa hình ảnh"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="flex gap-2 items-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    const input = document.getElementById(
                      "admin-chat-image-input"
                    ) as HTMLInputElement | null;
                    input?.click();
                  }}
                  disabled={sendingMessage}
                  className="h-10 w-10 p-0 rounded-full hover:bg-gray-100"
                  title="Chọn hình ảnh"
                  aria-label="Chọn hình ảnh"
                >
                  <ImageIcon className="w-8 h-8 text-gray-500 scale-150" />
                </Button>
                <Textarea
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    // Emit typing true ngay khi người dùng gõ
                    try {
                      if (
                        chatSocketManagerRef.current &&
                        selectedConversation
                      ) {
                        const senderId = (selectedConversation as any)
                          ?.provider_id;
                        const receiverId = (selectedConversation as any)
                          ?.user_id;
                        if (senderId && receiverId) {
                          console.log("Emitting typing true", senderId);
                          chatSocketManagerRef.current.emitTyping({
                            conversationId: selectedConversation.id,
                            senderId,
                            senderRole: "provider",
                            receiverId,
                            receiverRole: "user",
                            isTyping: true,
                          });
                        }
                      }
                    } catch (_) {}
                    // debounce gửi isTyping=false sau khi ngừng gõ 1.2s
                    if (typingTimeoutRef.current)
                      clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                      try {
                        if (
                          chatSocketManagerRef.current &&
                          selectedConversation
                        ) {
                          const senderId = (selectedConversation as any)
                            ?.provider_id;
                          const receiverId = (selectedConversation as any)
                            ?.user_id;
                          if (senderId && receiverId) {
                            chatSocketManagerRef.current.emitTyping({
                              conversationId: selectedConversation.id,
                              senderId,
                              senderRole: "provider",
                              receiverId,
                              receiverRole: "user",
                              isTyping: false,
                            });
                          }
                        }
                      } catch (_) {}
                    }, 2000);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                  disabled={sendingMessage}
                />
                {/* Input chọn ảnh ẩn */}
                <input
                  type="file"
                  accept="image/*"
                  title="Chọn hình ảnh"
                  aria-label="Chọn hình ảnh"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    if (file) {
                      setSelectedImage(file);
                      const url = URL.createObjectURL(file);
                      setImagePreviewUrl(url);
                    }
                  }}
                  className="hidden"
                  id="admin-chat-image-input"
                />

                <Button
                  onClick={handleSendMessage}
                  disabled={
                    (!newMessage.trim() && !selectedImage) || sendingMessage
                  }
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminChatSupport;
