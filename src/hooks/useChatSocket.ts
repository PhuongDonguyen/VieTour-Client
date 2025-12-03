import { useEffect, useMemo } from "react";
import {
  connectChatSocket,
  disconnectChatSocket,
  getSocketStatus,
  onReceiveMessage,
  offReceiveMessage,
  onUserTyping,
  offUserTyping,
  onMessageStatus,
  offMessageStatus,
  type ChatMessageReadPayload,
} from "../services/chatSocket.service";

interface UseChatSocketOptions {
  /**
   * Thông tin user hiện tại, dùng để auto connect socket.
   * Có thể lấy từ `useAuth()` rồi truyền vào.
   */
  user?: {
    id: number | string;
    role?: "user" | "provider" | "admin" | string;
  } | null;

  /**
   * Callback khi nhận tin nhắn mới
   */
  onMessageReceived?: (data: {
    conversationId: string;
    messageId: string;
    senderId: string;
    senderRole: "user" | "provider";
    text?: string;
    image_url?: string;
  }) => void;

  /**
   * Callback khi user khác đang gõ
   */
  onTyping?: (data: {
    conversationId: string;
    senderId: string;
    senderRole: "user" | "provider";
    isTyping: boolean;
  }) => void;

  /**
   * Callback khi trạng thái đọc tin nhắn thay đổi
   */
  onMessageRead?: (data: {
    conversationId: string;
    messageId: string;
    readerId: string;
    readerRole: "user" | "provider";
  }) => void;
}

export const useChatSocket = (options: UseChatSocketOptions = {}) => {
  const { user, onMessageReceived, onTyping, onMessageRead } = options;

  // Memo hoá handler để đảm bảo cùng tham chiếu khi cleanup
  const messageHandler = useMemo(() => onMessageReceived, [onMessageReceived]);
  const typingHandler = useMemo(() => onTyping, [onTyping]);
  const messageReadHandler = useMemo(() => onMessageRead, [onMessageRead]);

  // Tự động connect / disconnect theo user
  useEffect(() => {
    if (user && user.id != null) {
      connectChatSocket(user.id, user.role);
    }

    return () => {
      // Không reset global, chỉ disconnect cho an toàn
      disconnectChatSocket();
    };
  }, [user?.id, user?.role]);

  // Đăng ký lắng nghe sự kiện
  useEffect(() => {
    if (messageHandler) {
      onReceiveMessage(messageHandler);
    }
    if (typingHandler) {
      onUserTyping(typingHandler);
    }
    if (messageReadHandler) {
      onMessageStatus(messageReadHandler);
    }

    return () => {
      if (messageHandler) {
        offReceiveMessage(messageHandler);
      } else {
        offReceiveMessage();
      }

      if (typingHandler) {
        offUserTyping(typingHandler);
      } else {
        offUserTyping();
      }

      if (messageReadHandler) {
        offMessageStatus(messageReadHandler);
      } else {
        offMessageStatus();
      }
    };
  }, [messageHandler, typingHandler, messageReadHandler]);

  const status = getSocketStatus();

  return {
    /** Trạng thái hiện tại của socket (connected, connecting, attempts, ...) */
    status,
  };
};

export default useChatSocket;


