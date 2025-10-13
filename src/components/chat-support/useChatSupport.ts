import { useState, useCallback, useRef, useEffect } from "react";
import {
  fetchConversations,
  fetchConversationById,
} from "@/services/conversation.service";
import {
  fetchMessagesByConversation,
  createMessage,
  markMessageAsReadService,
} from "@/services/message.service";
import type { Conversation } from "@/apis/conversation.api";
import type { Message, SendMessagePayload } from "@/apis/message.api";
// Socket realtime removed
import { useAuth } from "@/hooks/useAuth";
import { ChatSocketManager } from "@/services/chatSocket.service";

type ChatActor = "user" | "provider";

interface UIMessage {
  id: number | string;
  text: string;
  sender: "user" | "provider";
  time: string;
  status: "sending" | "sent" | "read" | "failed";
  image_url: string;
}

interface UIConversation {
  id: number;
  user_id: number;
  provider_id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: "online" | "offline";
}

interface PeerDisplay {
  name: string;
  avatar: string;
}

const formatDisplayTime = (dateInput: string | Date): string => {
  const d = new Date(dateInput);
  const now = new Date();
  const isSameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const timePart = d.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isSameDay) return timePart;

  const datePart = d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return `${timePart} ${datePart}`;
};

const formatRelativeTime = (dateInput: string | Date): string => {
  if (!dateInput) return "";

  const d = new Date(dateInput);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 45) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;

  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const getPeerInfoFromConversation = (
  conv: Conversation,
  actor: ChatActor,
  customGetter?: (conv: Conversation) => PeerDisplay
): PeerDisplay => {
  if (customGetter) {
    return customGetter(conv);
  }

  if (actor === "user") {
    const providerProfile = conv.provider;
    return {
      name: providerProfile?.company_name || "",
      avatar: providerProfile?.avatar || "",
    };
  } else {
    const userProfile = conv.user;
    const fullName = userProfile
      ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
      : "";
    return {
      name: fullName,
      avatar: userProfile?.avatar || "",
    };
  }
};

export const useChatSupport = (
  actor: ChatActor,
  getPeerDisplay?: (conv: Conversation) => PeerDisplay
) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<UIConversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);
  const [messagesByConversation, setMessagesByConversation] = useState<
    Record<number, UIMessage[]>
  >({});
  const [messageInput, setMessageInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState<
    Record<number, boolean>
  >({});
  const [loadingMore, setLoadingMore] = useState<Record<number, boolean>>({});
  const [isSending, setIsSending] = useState(false);
  const typingTimeoutRef = useRef<any>(null);
  const [isTypingByConversation, setIsTypingByConversation] = useState<
    Record<number, boolean>
  >({});

  const [pageByConversation, setPageByConversation] = useState<
    Record<number, number>
  >({});
  const [hasMoreByConversation, setHasMoreByConversation] = useState<
    Record<number, boolean>
  >({});

  const selectedConversation =
    selectedConversationId !== null
      ? conversations.find((c) => c.id === selectedConversationId) || null
      : null;

  // Declare a socket manager instance (not used for realtime in this hook)
  const chatSocketManagerRef = useRef<ChatSocketManager | null>(null);
  useEffect(() => {
    chatSocketManagerRef.current = new ChatSocketManager();
    return () => {
      chatSocketManagerRef.current = null;
    };
  }, []);

  // When user is available, connect and join their rooms by user_id
  useEffect(() => {
    if (!user) return;
    if (!chatSocketManagerRef.current) return;
    chatSocketManagerRef.current.connect(user.id as any, actor);
    return () => {
      // Leave current conversation room before disconnect
      if (selectedConversationId && chatSocketManagerRef.current) {
        chatSocketManagerRef.current.leaveConversation(selectedConversationId);
      }
      chatSocketManagerRef.current?.disconnect();
    };
  }, [user, actor, selectedConversationId]);

  // (moved below loadMessages)

  const mapApiMessageToUI = useCallback(
    (apiMessage: Message, userId: number, providerId: number): UIMessage => {
      const isUserMessage = apiMessage.sender_id === userId;
      console.log("apiMessage: ", apiMessage);
      let status: UIMessage["status"] = "read";
      // if (isUserMessage) {
      status = apiMessage.is_read ? "read" : "sent";
      // }

      return {
        id: apiMessage.id,
        text: apiMessage.message_text || "",
        sender: isUserMessage ? "user" : "provider",
        time: formatDisplayTime(apiMessage.created_at),
        status,
        image_url: apiMessage.image_url || "",
      };
    },
    []
  );

  // Hàm helper để đánh dấu tin nhắn đã đọc
  const markMessagesAsRead = async (
    messages: UIMessage[],
    conversationId: number,
    providerId: number,
    conversation?: UIConversation
  ) => {
    try {
      // Lọc ra các tin nhắn có status = "sent" (chưa đọc)
      console.log("messages: ", messages);
      const unreadMessages = messages.filter((msg) => msg.status === "sent");
      console.log("đã vào đây");
      console.log("unreadMessages: ", unreadMessages);

      if (unreadMessages.length === 0) return;

      const messageIds = unreadMessages.map((msg) => Number(msg.id));
      const markedCount = unreadMessages.length; // Số lượng tin nhắn đã đánh dấu

      // Gọi API để đánh dấu đã đọc
      await markMessageAsReadService(messageIds);
      console.log("unreadMessages: ", unreadMessages);

      // Emit socket cho từng tin nhắn
      if (chatSocketManagerRef.current) {
        // Sử dụng conversation được truyền vào hoặc selectedConversation
        // const currentConversation = conversation || selectedConversation;
        const receiverId = providerId;
        const receiverRole = actor === "user" ? "provider" : "user";
        console.log("receiverId: ", receiverId);

        if (receiverId) {
          unreadMessages.forEach((msg) => {
            chatSocketManagerRef.current?.emitMessageRead({
              conversation_id: conversationId,
              message_id: Number(msg.id),
              readerRole: actor,
              receiverId,
              receiverRole,
            });
          });
        }
      }

      // Cập nhật UI để đánh dấu đã đọc
      setMessagesByConversation((prev) => ({
        ...prev,
        [conversationId]:
          prev[conversationId]?.map((msg) =>
            messageIds.includes(Number(msg.id))
              ? { ...msg, status: "read" as const }
              : msg
          ) || [],
      }));

      // Cập nhật unread count trong danh sách conversations
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === conversationId) {
            const currentUnreadCount = conv.unread || 0;
            const newUnreadCount = Math.max(
              0,
              currentUnreadCount - markedCount
            );
            return {
              ...conv,
              unread: newUnreadCount,
            };
          }
          return conv;
        })
      );
    } catch (error) {
      console.error("Lỗi khi đánh dấu tin nhắn đã đọc:", error);
    }
  };

  const loadMessages = useCallback(
    async (
      conversationId: number,
      userId: number,
      providerId: number,
      page: number = 1
    ) => {
      try {
        if (page === 1) {
          setLoadingMessages((prev) => ({ ...prev, [conversationId]: true }));
        } else {
          setLoadingMore((prev) => ({ ...prev, [conversationId]: true }));
        }

        const res = await fetchMessagesByConversation({
          conversation_id: conversationId,
          page,
          limit: 20,
        });

        if (res.success) {
          const orderedMessages = [...res.data].reverse();
          console.log("orderedMessages: ", orderedMessages);
          const mappedMessages = orderedMessages.map((msg) =>
            mapApiMessageToUI(msg, userId, providerId)
          );
          console.log("mappedMessages: ", mappedMessages);
          await markMessagesAsRead(mappedMessages, conversationId, providerId);
          setMessagesByConversation((prev) => {
            if (page === 1) {
              return { ...prev, [conversationId]: mappedMessages };
            } else {
              const existing = prev[conversationId] || [];
              return {
                ...prev,
                [conversationId]: [...mappedMessages, ...existing],
              };
            }
          });

          setPageByConversation((prev) => ({
            ...prev,
            [conversationId]: page,
          }));
          setHasMoreByConversation((prev) => ({
            ...prev,
            [conversationId]: res.pagination?.hasNextPage || false,
          }));
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoadingMessages((prev) => ({ ...prev, [conversationId]: false }));
        setLoadingMore((prev) => ({ ...prev, [conversationId]: false }));
      }
    },
    [mapApiMessageToUI]
  );

  // Load conversation theo ID khi chưa có trong danh sách
  const loadConversationById = useCallback(
    async (conversationId: number, newestMessage?: UIMessage) => {
      try {
        const response = await fetchConversationById(conversationId);
        if (response.success && response.data) {
          const conv = response.data;
          const peer = getPeerInfoFromConversation(conv, actor, getPeerDisplay);

          const newUIConversation: UIConversation = {
            id: conv.id,
            user_id: conv.user_id,
            provider_id: conv.provider_id,
            name: peer.name,
            avatar: peer.avatar,
            lastMessage: newestMessage?.text || conv.last_message_text || "",
            time: newestMessage
              ? "Vừa xong"
              : formatRelativeTime(conv.last_message_at),
            unread: selectedConversationId === conversationId ? 0 : 1,
            status: "online",
          };

          // Thêm conversation mới vào đầu danh sách
          setConversations((prev) => [newUIConversation, ...prev]);
        }
      } catch (error) {
        console.error("Error loading conversation by ID:", error);
      }
    },
    [actor, getPeerDisplay, selectedConversationId]
  );

  const loadConversationsData = useCallback(async () => {
    try {
      setIsConversationsLoading(true);
      const res = await fetchConversations(1, 20);

      if (res.success && res.data) {
        const mappedConversations: UIConversation[] = res.data.map((conv) => {
          const peer = getPeerInfoFromConversation(conv, actor, getPeerDisplay);

          return {
            id: conv.id,
            user_id: conv.user_id,
            provider_id: conv.provider_id,
            name: peer.name,
            avatar: peer.avatar,
            lastMessage: conv.last_message_text || "",
            time: formatRelativeTime(conv.last_message_at),
            unread:
              actor === "user"
                ? conv.unread_count_user
                : conv.unread_count_provider,
            status: "online",
          };
        });

        setConversations(mappedConversations);

        // Auto-select the first (latest) conversation only if none selected
        if (mappedConversations.length > 0 && !selectedConversationId) {
          const latestConversation = mappedConversations[0];
          setSelectedConversationId(latestConversation.id);

          // Load messages for the latest conversation
          await loadMessages(
            latestConversation.id,
            latestConversation.user_id,
            latestConversation.provider_id
          );

          // Mark as read if there are unread messages
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setIsConversationsLoading(false);
    }
  }, [actor, getPeerDisplay, loadMessages, selectedConversationId]);

  // Load conversations on mount
  useEffect(() => {
    loadConversationsData();
  }, [actor, getPeerDisplay, loadMessages]);

  // Socket realtime removed

  // Emit typing when messageInput has text; debounce to false after idle or when cleared
  useEffect(() => {
    if (!chatSocketManagerRef.current) return;
    if (!selectedConversation) return;
    if (!user) return;

    const trimmed = messageInput.trim();

    // If input is empty, emit isTyping=false immediately and skip
    if (!trimmed) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      try {
        const senderRole: "user" | "provider" = actor;
        const senderId = String(user.id || "");
        const receiverRole: "user" | "provider" =
          senderRole === "user" ? "provider" : "user";
        const receiverId =
          senderRole === "user"
            ? String(selectedConversation.provider_id)
            : String(selectedConversation.user_id);
        if (senderId && receiverId) {
          chatSocketManagerRef.current.emitTyping({
            conversationId: selectedConversation.id,
            senderId,
            senderRole,
            receiverId,
            receiverRole,
            isTyping: false,
          });
        }
      } catch (_) {}
      return;
    }

    try {
      const senderRole: "user" | "provider" = actor;
      const senderId = String(user.id || "");
      const receiverRole: "user" | "provider" =
        senderRole === "user" ? "provider" : "user";
      const receiverId =
        senderRole === "user"
          ? String(selectedConversation.provider_id)
          : String(selectedConversation.user_id);

      if (senderId && receiverId) {
        chatSocketManagerRef.current.emitTyping({
          conversationId: selectedConversation.id,
          senderId,
          senderRole,
          receiverId,
          receiverRole,
          isTyping: true,
        });
      }
    } catch (_) {}

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      try {
        const senderRole: "user" | "provider" = actor;
        const senderId = String(user?.id || "");
        const receiverRole: "user" | "provider" =
          senderRole === "user" ? "provider" : "user";
        const receiverId =
          senderRole === "user"
            ? String(selectedConversation.provider_id)
            : String(selectedConversation.user_id);
        if (senderId && receiverId) {
          chatSocketManagerRef.current?.emitTyping({
            conversationId: selectedConversation.id,
            senderId,
            senderRole,
            receiverId,
            receiverRole,
            isTyping: false,
          });
        }
      } catch (_) {}
    }, 5000);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [messageInput, selectedConversation, actor, user]);

  const refreshConversations = useCallback(async () => {
    await loadConversationsData();
  }, [loadConversationsData]);

  const loadMoreMessages = useCallback(
    async (conversationId: number) => {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) return;
      if (loadingMore[conversationId]) return;
      if (!hasMoreByConversation[conversationId]) return;

      const nextPage = (pageByConversation[conversationId] || 1) + 1;
      await loadMessages(
        conversationId,
        conv.user_id,
        conv.provider_id,
        nextPage
      );
    },
    [
      conversations,
      loadingMore,
      hasMoreByConversation,
      pageByConversation,
      loadMessages,
    ]
  );

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
      console.log("Received socket message:", data);

      try {
        // Tạo message mới từ data nhận được
        const newMessage: UIMessage = {
          id: Number(data.messageId),
          text: data.text || "",
          sender: data.senderRole,
          time: formatDisplayTime(new Date()),
          status: "sent",
          image_url: data.image_url || "",
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
        }

        // Nếu đang mở conversation này, đánh dấu tin nhắn đã đọc ngay lập tức
        if (selectedConversationId === convId && user) {
          // Tìm conversation để lấy provider_id
          const currentConversation = conversations.find(
            (c) => c.id === convId
          );
          if (currentConversation) {
            // Đánh dấu tin nhắn đã đọc
            markMessagesAsRead(
              [newMessage],
              convId,
              currentConversation.provider_id,
              currentConversation
            );
          } else {
            // Nếu chưa có conversation trong state, cần load conversation trước
            // Tạm thời đánh dấu tin nhắn là đã đọc trong UI
            setMessagesByConversation((prev) => ({
              ...prev,
              [convId]: (prev[convId] || []).map((msg) =>
                msg.id === newMessage.id
                  ? { ...msg, status: "read" as const }
                  : msg
              ),
            }));
          }
        }

        // Kiểm tra xem conversation đã có trong danh sách chưa
        setConversations((prev) => {
          const existingConversation = prev.find((c) => c.id === convId);

          if (existingConversation) {
            // Nếu đã có, cập nhật và đưa lên đầu
            const updatedConversation = {
              ...existingConversation,
              lastMessage: newMessage.text || "[Hình ảnh]",
              time: "Vừa xong",
              unread:
                selectedConversationId === convId
                  ? 0
                  : existingConversation.unread + 1,
            };

            // Đưa conversation lên đầu danh sách
            return [
              updatedConversation,
              ...prev.filter((c) => c.id !== convId),
            ];
          } else {
            // Nếu chưa có, load conversation mới
            loadConversationById(convId, newMessage);
            return prev;
          }
        });
      } catch (_) {
        /* ignore */
      }
    };

    chatSocketManagerRef.current.onReceiveMessage(handler);
    return () => {
      chatSocketManagerRef.current?.offReceiveMessage(handler);
    };
  }, [conversations, selectedConversationId, loadConversationById]);

  // Lắng nghe trạng thái đang nhập từ đối phương
  useEffect(() => {
    if (!chatSocketManagerRef.current) return;

    const handleTyping = (data: {
      conversationId: string;
      senderId: string;
      senderRole: "user" | "provider";
      isTyping: boolean;
    }) => {
      const convId = Number(data.conversationId);
      setIsTypingByConversation((prev) => ({
        ...prev,
        [convId]: data.isTyping,
      }));
    };

    chatSocketManagerRef.current.onUserTyping(handleTyping);
    return () =>
      chatSocketManagerRef.current?.offUserTyping(handleTyping as any);
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

      console.log("Received message read status:", data);

      // Cập nhật trạng thái tin nhắn trong cache
      setMessagesByConversation((prev) => {
        const conversationMessages = prev[convId];
        if (!conversationMessages) return prev;

        const updatedMessages = conversationMessages.map((msg) => {
          // Chỉ cập nhật tin nhắn của mình (tin nhắn mà mình gửi)
          if (msg.id === msgId && msg.sender === actor) {
            return { ...msg, status: "read" as const };
          }
          return msg;
        });

        return {
          ...prev,
          [convId]: updatedMessages,
        };
      });
    };

    chatSocketManagerRef.current.onMessageStatus(handleMessageStatus);
    return () => {
      chatSocketManagerRef.current?.offMessageStatus(handleMessageStatus);
    };
  }, [actor]);

  const handleConversationSelect = useCallback(
    async (conversationId: number) => {
      const conv = conversations.find((c) => c.id === conversationId);
      if (!conv) return;

      // Leave previous conversation room
      if (selectedConversationId && chatSocketManagerRef.current) {
        chatSocketManagerRef.current.leaveConversation(selectedConversationId);
      }

      // Join new conversation room
      if (chatSocketManagerRef.current) {
        chatSocketManagerRef.current.joinConversation(conversationId);
      }

      setSelectedConversationId(conversationId);

      // Only load messages if not already loaded
      if (!messagesByConversation[conversationId]) {
        await loadMessages(conversationId, conv.user_id, conv.provider_id);
      }
    },
    [
      conversations,
      messagesByConversation,
      loadMessages,
      actor,
      selectedConversationId,
    ]
  );

  const handleSendMessage = useCallback(
    async (imageFile?: File, newProviderId?: number) => {
      if (!selectedConversation && !newProviderId) return;
      if (isSending) return;

      const text = messageInput.trim();
      if (!text && !imageFile) return;

      const conversationId = selectedConversation?.id || 0;
      const isNewChat = conversationId === 0;

      try {
        setIsSending(true);

        const tempId = `temp-${Date.now()}`;
        const tempMessage: UIMessage = {
          id: tempId,
          text,
          sender: actor,
          time: "",
          status: "sending",
          image_url: imageFile ? URL.createObjectURL(imageFile) : "",
        };

        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), tempMessage],
        }));

        const payload: SendMessagePayload = {
          message_text: text,
        };
        console.log("image file:", imageFile);
        if (imageFile) {
          payload.image = imageFile;
        }

        if (isNewChat && newProviderId) {
          payload.receiver_id = newProviderId;
        } else {
          payload.conversation_id = conversationId;
        }
        console.log("Sending payload:", payload);
        const res = await createMessage(payload);

        const sentMessage: UIMessage = {
          id: res.data.id,
          text: res.data.message_text || text,
          sender: actor,
          time: formatDisplayTime(res.data.created_at),
          status: "sent",
          image_url: res.data.image_url || "",
        };

        if (isNewChat) {
          await loadConversationsData();

          const newConversationId = res.data.conversation_id;
          if (newConversationId) {
            setSelectedConversationId(newConversationId);

            setMessagesByConversation((prev) => ({
              ...prev,
              [newConversationId]: [sentMessage],
            }));

            // Emit socket event sendMessage tới conversation room
            try {
              if (chatSocketManagerRef.current) {
                const senderRole: "user" | "provider" = actor;
                const senderId = String(user?.id || "");
                const receiverRole: "user" | "provider" =
                  senderRole === "user" ? "provider" : "user";
                const receiverId = String(newProviderId || "");
                if (senderId && receiverId) {
                  chatSocketManagerRef.current.emitSendMessage({
                    conversationId: newConversationId,
                    messageId: res.data.id,
                    senderId,
                    senderRole,
                    receiverId,
                    receiverRole,
                    text: res.data.message_text,
                    image_url: res.data.image_url || undefined,
                  });
                }
              }
            } catch (_) {}
          }
        } else {
          setMessagesByConversation((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map((m) =>
              m.id === tempId ? sentMessage : m
            ),
          }));

          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId
                ? { ...c, lastMessage: text || "[Hình ảnh]", time: "Vừa xong" }
                : c
            )
          );

          // Emit socket event sendMessage cho hội thoại đã tồn tại
          try {
            if (chatSocketManagerRef.current && selectedConversation) {
              const senderRole: "user" | "provider" = actor;
              const senderId = String(user?.id || "");
              const receiverRole: "user" | "provider" =
                senderRole === "user" ? "provider" : "user";
              const receiverId =
                senderRole === "user"
                  ? String(selectedConversation.provider_id)
                  : String(selectedConversation.user_id);
              if (senderId && receiverId) {
                chatSocketManagerRef.current.emitSendMessage({
                  conversationId,
                  messageId: res.data.id,
                  senderId,
                  senderRole,
                  receiverId,
                  receiverRole,
                  text: res.data.message_text,
                  image_url: res.data.image_url || undefined,
                });
              }
            }
          } catch (_) {}
        }

        setMessageInput("");
      } catch (error) {
        console.error("Error sending message:", error);

        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: (prev[conversationId] || []).map((m) =>
            typeof m.id === "string" &&
            m.id.startsWith("temp-") &&
            m.text === text
              ? { ...m, status: "failed" }
              : m
          ),
        }));
      } finally {
        setIsSending(false);
      }
    },
    [
      selectedConversation,
      isSending,
      messageInput,
      actor,
      loadConversationsData,
    ]
  );

  // Socket realtime removed

  const handleMessagesScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!selectedConversation) return;

      const el = e.currentTarget;
      if (el.scrollTop <= 50) {
        loadMoreMessages(selectedConversation.id);
      }
    },
    [selectedConversation, loadMoreMessages]
  );

  const messages = selectedConversation
    ? messagesByConversation[selectedConversation.id] || []
    : [];

  const isPeerTyping = selectedConversation
    ? !!isTypingByConversation[selectedConversation.id]
    : false;
  const peerTypingText = isPeerTyping ? "..." : "";

  return {
    conversations,
    selectedConversation,
    selectedConversationId,
    messages,
    messageInput,
    searchQuery,
    isConversationsLoading,
    isMessagesLoading: selectedConversation
      ? loadingMessages[selectedConversation.id] || false
      : false,
    isLoadingMore: selectedConversation
      ? loadingMore[selectedConversation.id] || false
      : false,
    isSending,
    isPeerTyping,
    peerTypingText,
    setMessageInput,
    setSearchQuery,
    handleConversationSelect,
    handleSendMessage,
    handleMessagesScroll,
    refreshConversations,
    setSelectedConversationId,
    actor,
  };
};
