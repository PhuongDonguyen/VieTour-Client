import { useState, useCallback, useRef, useEffect } from "react";
import {
  fetchConversations,
  fetchConversationById,
  filterFetchConversations,
} from "@/services/conversation.service";
import {
  fetchMessagesByConversation,
  createMessage,
  markMessageAsReadService,
} from "@/services/message.service";
import type { Conversation } from "@/apis/conversation.api";
import { filterConversations as apiFilterConversations } from "@/apis/conversation.api";
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
  provider_account_id?: number | null;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  lastMessageAt?: string;
  unread: number;
  partner_presence: {
    online: boolean;
    lastOfflineAt?: string | null;
  };
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
  // Search (server-side) flow
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filteredConversations, setFilteredConversations] = useState<
    UIConversation[]
  >([]);

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
  // Ngăn auto scroll xuống đáy khi đang khôi phục vị trí từ loadMore
  const preventAutoScrollRef = useRef(false);

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
    chatSocketManagerRef.current.connect(user.id as any, actor, user?.account_id);
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
    (apiMessage: Message, providerAccountId?: number | null): UIMessage => {
      const senderAccountId = Number(apiMessage.sender_id);
      const providerAccount =
        providerAccountId != null ? Number(providerAccountId) : null;
      console.log("senderAccountId: ", senderAccountId);
      console.log("providerAccount: ", providerAccount);
      const isProviderMessage =
        providerAccount != null && senderAccountId === providerAccount;
      const sender: "user" | "provider" = isProviderMessage
        ? "provider"
        : "user";
      console.log("sender: ", sender);
      const status: UIMessage["status"] = apiMessage.is_read ? "read" : "sent";

      return {
        id: apiMessage.id,
        text: apiMessage.message_text || "",
        sender,
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
      const response = await markMessageAsReadService(messageIds);
      const resData = response.data;
      console.log("response: ", response);
      console.log("unreadMessages: ", unreadMessages);

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
      providerAccountId?: number | null,
      page: number = 1
    ) => {
      try {
        if (page === 1) {
          setLoadingMessages((prev) => ({ ...prev, [conversationId]: true }));
        } else {
          setLoadingMore((prev) => ({ ...prev, [conversationId]: true }));
          preventAutoScrollRef.current = true;

          // Lưu vị trí cuộn trước khi load thêm tin nhắn cũ
          const messagesContainer = document.querySelector(
            "[data-messages-container]"
          ) as HTMLElement;
          if (messagesContainer) {
            const prevScrollHeight = messagesContainer.scrollHeight || 0;
            const prevScrollTop = messagesContainer.scrollTop || 0;
            // Lưu vào element để sử dụng sau
            (messagesContainer as any).prevScrollHeight = prevScrollHeight;
            (messagesContainer as any).prevScrollTop = prevScrollTop;
          }
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
            mapApiMessageToUI(msg, providerAccountId)
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
          console.log("page: ", page);

          setPageByConversation((prev) => ({
            ...prev,
            [conversationId]: page,
          }));
          setHasMoreByConversation((prev) => ({
            ...prev,
            [conversationId]: res.pagination?.hasNextPage || false,
          }));

          // Giữ vị trí cuộn khi load thêm tin nhắn cũ (new - prev)
          if (page > 1) {
            // Đo sau double rAF để đảm bảo DOM đã commit đủ cho text messages
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                const messagesContainer = document.querySelector(
                  "[data-messages-container]"
                ) as HTMLElement;
                if (
                  messagesContainer &&
                  (messagesContainer as any).prevScrollHeight != null
                ) {
                  const newScrollHeight = messagesContainer.scrollHeight;
                  const prevScrollHeight = (messagesContainer as any)
                    .prevScrollHeight as number;
                  // Giữ viewport với tin nhắn text: new - prev
                  messagesContainer.scrollTop =
                    newScrollHeight - prevScrollHeight;
                  // Cho phép auto scroll hoạt động lại sau khi khôi phục xong
                  setTimeout(() => {
                    preventAutoScrollRef.current = false;
                  }, 120);
                }
              });
            });
          }
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
            provider_account_id: conv.provider?.account_id ?? null,
            name: peer.name,
            avatar: peer.avatar,
            lastMessage: newestMessage?.text || conv.last_message_text || "",
            time: newestMessage
              ? "Vừa xong"
              : formatRelativeTime(conv.last_message_at),
            lastMessageAt: newestMessage
              ? new Date().toISOString()
              : (conv as any).last_message_at,
            unread: selectedConversationId === conversationId ? 0 : 1,
            partner_presence: conv.partner_presence || {
              online: false,
              lastOfflineAt: null,
            },
          };

          // Thêm conversation mới vào đầu danh sách
          setConversations((prev) => [newUIConversation, ...prev]);
          chatSocketManagerRef.current?.subscribePresence([
            {
              userId: conv.provider_id,
              role: "provider",
            },
          ]);
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
      // Always fetch in page units of 20 to avoid overlap when loading more later
      const PAGE_UNIT = 20;
      const res = await fetchConversations(1, PAGE_UNIT);

      if (res.success && res.data) {
        let mappedConversations: UIConversation[] = res.data.map((conv) => {
          const peer = getPeerInfoFromConversation(conv, actor, getPeerDisplay);

          return {
            id: conv.id,
            user_id: conv.user_id,
            provider_id: conv.provider_id,
            provider_account_id: conv.provider?.account_id ?? null,
            name: peer.name,
            avatar: peer.avatar,
            lastMessage: conv.last_message_text || "",
            time: formatRelativeTime(conv.last_message_at),
            lastMessageAt: (conv as any).last_message_at,
            unread:
              actor === "user"
                ? conv.unread_count_user
                : conv.unread_count_provider,
            partner_presence: conv.partner_presence || {
              online: false,
              lastOfflineAt: null,
            },
          };
        });
        // Ensure the list length is a multiple of 20 (trim tail if necessary)
        if (mappedConversations.length % PAGE_UNIT !== 0) {
          mappedConversations = mappedConversations.slice(
            0,
            Math.floor(mappedConversations.length / PAGE_UNIT) * PAGE_UNIT ||
              PAGE_UNIT
          );
        }

        setConversations(mappedConversations);
        chatSocketManagerRef.current?.subscribePresence(
          mappedConversations.map((conv) => ({
            userId: conv.provider_id,
            role: "provider",
          }))
        );
        // Auto-select the first (latest) conversation only if none selected
        if (mappedConversations.length > 0 && !selectedConversationId) {
          const latestConversation = mappedConversations[0];
          setSelectedConversationId(latestConversation.id);

          // Load messages for the latest conversation
          await loadMessages(
            latestConversation.id,
            latestConversation.user_id,
            latestConversation.provider_id,
            latestConversation.provider_account_id
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

  // Trigger server-side search; when keyword empty, exit search mode
  const searchConversations = useCallback(
    async (keyword: string) => {
      const q = (keyword || "").trim();
      if (!q) {
        setIsSearchMode(false);
        setFilteredConversations([]);
        setIsFiltering(false);
        setSearchQuery("");
        return;
      }
      try {
        setIsFiltering(true);
        setIsSearchMode(true);
        setSearchQuery(q);
        const res = await filterFetchConversations(1, 20, q);
        console.log(
          "[useChatSupport] filterFetchConversations keyword=",
          q,
          "response:",
          res
        );
        const mapped: UIConversation[] = (res.data || []).map((conv) => {
          const peer = getPeerInfoFromConversation(conv, actor, getPeerDisplay);
          return {
            id: conv.id,
            user_id: conv.user_id,
            provider_id: conv.provider_id,
            provider_account_id: conv.provider?.account_id ?? null,
            name: peer.name,
            avatar: peer.avatar,
            lastMessage: conv.last_message_text || "",
            time: formatRelativeTime(conv.last_message_at),
            lastMessageAt: (conv as any).last_message_at,
            unread:
              actor === "user"
                ? conv.unread_count_user
                : conv.unread_count_provider,
            partner_presence: conv.partner_presence || {
              online: false,
              lastOfflineAt: null,
            },
          };
        });
        setFilteredConversations(mapped);
      } catch (e) {
        console.error("[useChatSupport] filterFetchConversations error:", e);
      } finally {
        setIsFiltering(false);
      }
    },
    [actor, getPeerDisplay]
  );

  // Ensure presence subscriptions happen after socket connects and on conversation changes
  useEffect(() => {
    const mgr = chatSocketManagerRef.current;
    if (!mgr) return;
    const s = mgr.getSocket();

    const doSubscribe = () => {
      if (!conversations || conversations.length === 0) return;
      mgr.subscribePresence(
        conversations.map((conv) => ({
          userId: conv.provider_id,
          role: "provider",
        }))
      );
    };

    if (s.connected) doSubscribe();
    s.on("connect", doSubscribe);

    return () => {
      try {
        s.off("connect", doSubscribe as any);
      } catch (_) {}
    };
  }, [conversations]);

  // Tick mỗi phút để cập nhật thời gian tương đối của last message
  useEffect(() => {
    const id = setInterval(() => {
      setConversations((prev) =>
        prev.map((c) => ({
          ...c,
          time: c.lastMessageAt ? formatRelativeTime(c.lastMessageAt) : c.time,
        }))
      );
    }, 60000);
    return () => clearInterval(id);
  }, []);

  // Auto scroll to bottom when messages change (only for new messages, not when loading older messages)
  useEffect(() => {
    if (
      selectedConversation &&
      messagesByConversation[selectedConversation.id]
    ) {
      // Chỉ auto scroll khi có tin nhắn mới (socket message) hoặc khi mới chọn conversation
      // Không scroll khi đang loading more messages
      const messagesContainer = document.querySelector(
        "[data-messages-container]"
      ) as HTMLElement;
      if (
        messagesContainer &&
        !loadingMore[selectedConversation.id] &&
        !preventAutoScrollRef.current
      ) {
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 50);
      }
    }
  }, [selectedConversation, messagesByConversation, loadingMore]);

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
        conv.provider_account_id,
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
        // Dùng giá trị prev mới nhất để tránh stale-closure
        setMessagesByConversation((prev) => {
          const existingMessages = prev[convId];
          if (existingMessages && existingMessages.length > 0) {
            return {
              ...prev,
              [convId]: [...existingMessages, newMessage],
            };
          }
          return prev;
        });

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
              lastMessageAt: new Date().toISOString(),
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

  // Lắng nghe trạng thái presence (online/offline) và cập nhật partner_presence
  useEffect(() => {
    if (!chatSocketManagerRef.current) return;

    const handlePresence = (payload: {
      userId: string;
      role: "user" | "provider";
      online: boolean;
      lastOfflineAt?: string | null;
    }) => {
      console.log("Received presence status:", payload);
      setConversations((prev) =>
        prev.map((conv) => {
          // Với màn hình user, partner là provider
          if (
            payload.role === "provider" &&
            String(conv.provider_id) === String(payload.userId)
          ) {
            return {
              ...conv,
              partner_presence: {
                online: payload.online,
                lastOfflineAt: payload.lastOfflineAt,
              },
            };
          }
          return conv;
        })
      );
    };

    chatSocketManagerRef.current.onPresenceStatusChanged(handlePresence);
    return () => {
      chatSocketManagerRef.current?.offPresenceStatusChanged(handlePresence);
    };
  }, []);

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
        await loadMessages(
          conversationId,
          conv.user_id,
          conv.provider_id,
          conv.provider_account_id
        );
      }

      // Auto scroll to bottom after selecting conversation
      setTimeout(() => {
        const messagesContainer = document.querySelector(
          "[data-messages-container]"
        ) as HTMLElement;
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
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

          }
        } else {
          setMessagesByConversation((prev) => ({
            ...prev,
            [conversationId]: (prev[conversationId] || []).map((m) =>
              m.id === tempId ? sentMessage : m
            ),
          }));

          setConversations((prev) => {
            const updated = prev.map((c) =>
              c.id === conversationId
                ? {
                    ...c,
                    lastMessage: text || "[Hình ảnh]",
                    time: "Vừa xong",
                    lastMessageAt: new Date().toISOString(),
                  }
                : c
            );
            const moved = updated.find((c) => c.id === conversationId);
            if (!moved) {
              const newConv = {
                ...(selectedConversation as any),
                lastMessage: text || "[Hình ảnh]",
                time: "Vừa xong",
                lastMessageAt: new Date().toISOString(),
              } as any;
              return [newConv, ...updated];
            }
            return [moved, ...updated.filter((c) => c.id !== conversationId)];
          });

        }

        // Exit search mode after sending
        setIsSearchMode(false);
        setFilteredConversations([]);
        setIsFiltering(false);
        setSearchQuery("");

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
    filteredConversations,
    selectedConversation,
    selectedConversationId,
    messages,
    messageInput,
    searchQuery,
    isSearchMode,
    isFiltering,
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
    searchConversations,
    handleConversationSelect,
    handleSendMessage,
    handleMessagesScroll,
    refreshConversations,
    setSelectedConversationId,
    actor,
  };
};
