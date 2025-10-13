import { io, Socket } from "socket.io-client";

type UserType = "user" | "provider" | "admin" | string;

export interface ChatMessageSentPayload {
  conversation_id: string | number;
  id: string | number; // message id
  sender_id: string | number;
}

export interface ChatTypingPayload {
  conversation_id: string | number;
  user_id: string | number;
  isTyping: boolean;
}

export interface ChatMessageReadPayload {
  conversation_id: string | number;
  message_id: string | number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// Class-based approach để mỗi instance có socket riêng
export class ChatSocketManager {
  private socket: Socket | null = null;
  private isConnecting = false;
  private connectionAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private userId: string | number | null = null;
  private userType: UserType | null = null;

  constructor() {
    console.log("ChatSocketManager instance created");
  }

  getSocket(): Socket {
    if (!this.socket) {
      this.socket = io(API_BASE_URL, {
        transports: ["websocket"],
        withCredentials: false,
        autoConnect: false,
      });

      // Thêm event listeners cho socket
      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket?.id);
        this.isConnecting = false;
        this.connectionAttempts = 0;
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        this.isConnecting = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        this.isConnecting = false;
        this.connectionAttempts++;
      });
    }
    return this.socket;
  }

  getStatus() {
    return {
      connected: this.socket?.connected || false,
      connecting: this.isConnecting,
      connectionAttempts: this.connectionAttempts,
      socketId: this.socket?.id || null,
      userId: this.userId,
      userType: this.userType,
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  connect(userId?: string | number, userType?: UserType) {
    const s = this.getSocket();
    if (!s.connected && !this.isConnecting) {
      this.isConnecting = true;
      this.userId = userId || null;
      this.userType = userType || null;
      s.connect();
    }
    if (userId != null) {
      // Map role to server-accepted roles only: 'user' | 'provider'
      const role = String(userType) === "provider" ? "provider" : "user";
      s.emit("chat:join", String(userId), role as "user" | "provider");
    }
  }

  disconnect() {
    if (this.socket && this.socket.connected) {
      this.socket.disconnect();
    }
    this.isConnecting = false;
    this.connectionAttempts = 0;
  }

  reset() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.removeAllListeners();
      this.socket = null;
    }
    this.isConnecting = false;
    this.connectionAttempts = 0;
    this.userId = null;
    this.userType = null;
    console.log("ChatSocketManager reset completed");
  }

  getDebugInfo() {
    return {
      socket: this.socket
        ? {
            id: this.socket.id,
            connected: this.socket.connected,
            disconnected: this.socket.disconnected,
          }
        : null,
      isConnecting: this.isConnecting,
      connectionAttempts: this.connectionAttempts,
      userId: this.userId,
      userType: this.userType,
      apiBaseUrl: API_BASE_URL,
    };
  }

  // Conversation room management
  joinConversation(conversationId: string | number) {
    const s = this.getSocket();
    if (!s.connected) return;
    s.emit("chat:joinConversation", String(conversationId));
  }

  leaveConversation(conversationId: string | number) {
    const s = this.getSocket();
    if (!s.connected) return;
    s.emit("chat:leaveConversation", String(conversationId));
  }

  // Emits
  emitSendMessage(data: {
    conversationId: string | number;
    messageId: string | number;
    senderId: string | number;
    senderRole: "user" | "provider";
    receiverId: string | number;
    receiverRole: "user" | "provider";
    text?: string;
    image_url?: string;
  }) {
    const s = this.getSocket();
    if (!s.connected) return;
    s.emit("chat:sendMessage", {
      conversationId: String(data.conversationId),
      messageId: String(data.messageId),
      senderId: String(data.senderId),
      senderRole: data.senderRole,
      receiverId: String(data.receiverId),
      receiverRole: data.receiverRole,
      text: data.text,
      image_url: data.image_url,
    });
  }

  // legacy emitTyping removed; use emitTypingV2 instead

  emitTyping(data: {
    conversationId: string | number;
    senderId: string | number;
    senderRole: "user" | "provider";
    receiverId: string | number;
    receiverRole: "user" | "provider";
    isTyping: boolean;
  }) {
    const s = this.getSocket();
    if (!s.connected) return;
    s.emit("chat:typing", {
      conversationId: String(data.conversationId),
      senderId: String(data.senderId),
      senderRole: data.senderRole,
      receiverId: String(data.receiverId),
      receiverRole: data.receiverRole,
      isTyping: data.isTyping,
    });
  }

  emitMessageRead(
    payload: ChatMessageReadPayload & {
      readerRole?: "user" | "provider";
      receiverId?: string | number;
      receiverRole?: "user" | "provider";
    }
  ) {
    const s = this.getSocket();
    if (!s.connected) return;
    const readerRole: "user" | "provider" =
      payload.readerRole ||
      (String(this.userType) === "provider" ? "provider" : "user");
    const receiverRole: "user" | "provider" =
      payload.receiverRole || (readerRole === "user" ? "provider" : "user");
    s.emit("chat:readMessage", {
      conversationId: String(payload.conversation_id),
      messageId: String(payload.message_id),
      readerId: String(this.userId || ""),
      readerRole,
      receiverId: String(payload.receiverId || ""),
      receiverRole,
    });
  }

  // Listeners
  onReceiveMessage(
    handler: (data: {
      conversationId: string;
      messageId: string;
      senderId: string;
      senderRole: "user" | "provider";
      text?: string;
      image_url?: string;
    }) => void
  ) {
    const s = this.getSocket();
    s.on("chat:receiveMessage", handler);
  }

  offReceiveMessage(
    handler?: (data: {
      conversationId: string;
      messageId: string;
      senderId: string;
      senderRole: "user" | "provider";
      text?: string;
      image_url?: string;
    }) => void
  ) {
    const s = this.getSocket();
    if (handler) s.off("chat:receiveMessage", handler);
    else s.off("chat:receiveMessage");
  }

  onUserTyping(
    handler: (data: {
      conversationId: string;
      senderId: string;
      senderRole: "user" | "provider";
      isTyping: boolean;
    }) => void
  ) {
    const s = this.getSocket();
    s.on("chat:userTyping", handler);
  }

  offUserTyping(
    handler?: (data: {
      conversationId: string;
      senderId: string;
      senderRole: "user" | "provider";
      isTyping: boolean;
    }) => void
  ) {
    const s = this.getSocket();
    if (handler) s.off("chat:userTyping", handler);
    else s.off("chat:userTyping");
  }

  onMessageStatus(
    handler: (data: {
      conversationId: string;
      messageId: string;
      readerId: string;
      readerRole: "user" | "provider";
    }) => void
  ) {
    const s = this.getSocket();
    s.on("chat:messageRead", handler);
  }

  offMessageStatus(
    handler?: (data: {
      conversationId: string;
      messageId: string;
      readerId: string;
      readerRole: "user" | "provider";
    }) => void
  ) {
    const s = this.getSocket();
    if (handler) s.off("chat:messageRead", handler);
    else s.off("chat:messageRead");
  }
}

// Factory function để tạo instance mới
export const createChatSocketManager = (): ChatSocketManager => {
  return new ChatSocketManager();
};

// Global instance cho backward compatibility (không khuyến khích dùng)
let globalChatManager: ChatSocketManager | null = null;

export const getGlobalChatManager = (): ChatSocketManager => {
  if (!globalChatManager) {
    globalChatManager = new ChatSocketManager();
  }
  return globalChatManager;
};

// Backward compatibility functions (sử dụng global instance)
export const getChatSocket = (): Socket => {
  return getGlobalChatManager().getSocket();
};

export const getSocketStatus = () => {
  return getGlobalChatManager().getStatus();
};

export const isSocketConnected = (): boolean => {
  return getGlobalChatManager().isConnected();
};

export const connectChatSocket = (
  userId?: string | number,
  userType?: UserType
) => {
  getGlobalChatManager().connect(userId, userType);
};

export const disconnectChatSocket = () => {
  getGlobalChatManager().disconnect();
};

export const resetSocket = () => {
  getGlobalChatManager().reset();
};

export const getDebugInfo = () => {
  return getGlobalChatManager().getDebugInfo();
};

// Conversation room management
export const joinConversation = (conversationId: string | number) => {
  getGlobalChatManager().joinConversation(conversationId);
};

export const leaveConversation = (conversationId: string | number) => {
  getGlobalChatManager().leaveConversation(conversationId);
};

// Emits
export const emitSendMessage = (data: {
  conversationId: string | number;
  messageId: string | number;
  senderId: string | number;
  senderRole: "user" | "provider";
  receiverId: string | number;
  receiverRole: "user" | "provider";
  text?: string;
  image_url?: string;
}) => {
  getGlobalChatManager().emitSendMessage(data);
};

// legacy emitTyping removed; use instance.emitTypingV2 instead

export const emitMessageRead = (payload: ChatMessageReadPayload) => {
  getGlobalChatManager().emitMessageRead(payload);
};

// Listeners
export const onReceiveMessage = (
  handler: (data: {
    conversationId: string;
    messageId: string;
    senderId: string;
    senderRole: "user" | "provider";
    text?: string;
    image_url?: string;
  }) => void
) => {
  getGlobalChatManager().onReceiveMessage(handler);
};

export const offReceiveMessage = (
  handler?: (data: {
    conversationId: string;
    messageId: string;
    senderId: string;
    senderRole: "user" | "provider";
    text?: string;
    image_url?: string;
  }) => void
) => {
  getGlobalChatManager().offReceiveMessage(handler);
};

export const onUserTyping = (
  handler: (data: {
    conversationId: string;
    senderId: string;
    senderRole: "user" | "provider";
    isTyping: boolean;
  }) => void
) => {
  getGlobalChatManager().onUserTyping(handler);
};

export const offUserTyping = (
  handler?: (data: {
    conversationId: string;
    senderId: string;
    senderRole: "user" | "provider";
    isTyping: boolean;
  }) => void
) => {
  getGlobalChatManager().offUserTyping(handler);
};

export const onMessageStatus = (
  handler: (data: {
    conversationId: string;
    messageId: string;
    readerId: string;
    readerRole: "user" | "provider";
  }) => void
) => {
  getGlobalChatManager().onMessageStatus(handler);
};

export const offMessageStatus = (
  handler?: (data: {
    conversationId: string;
    messageId: string;
    readerId: string;
    readerRole: "user" | "provider";
  }) => void
) => {
  getGlobalChatManager().offMessageStatus(handler);
};

// Helper to wire basic lifecycle quickly
export const initChatRealtime = (
  user: { id: number | string; role?: UserType } | null | undefined
) => {
  if (!user) return;
  getGlobalChatManager().connect(user.id, (user.role as UserType) || "user");
};
