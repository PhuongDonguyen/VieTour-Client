import { io, Socket } from "socket.io-client";

export interface UserCMT {
  id: number | string;
  name?: string;
  avatar?: string;
  [key: string]: any;
}

export interface CommentPayload {
  id: number;
  user: UserCMT;
  tour_id: number;
  text: string;
  parent_question_id: number|null;
  reported: boolean;
}

export interface CommentReceivedPayload {
  id: number;
  user: UserCMT;
  text: string;
  tour_id: number;
  created_at: string;
  parent_question_id: number|null;
  reported: boolean;
}

export interface DeleteCommentPayload {
  id: number;
  tour_id: number;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// Class-based approach để mỗi instance có socket riêng
export class CommentSocketManager {
  private socket: Socket | null = null;
  private isConnecting = false;
  private connectionAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  constructor() {
    console.log("CommentSocketManager instance created");
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
        console.log("Comment socket connected:", this.socket?.id);
        this.isConnecting = false;
        this.connectionAttempts = 0;
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Comment socket disconnected:", reason);
        this.isConnecting = false;
      });

      this.socket.on("connect_error", (error) => {
        console.error("Comment socket connection error:", error);
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
    };
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  connect() {
    const s = this.getSocket();
    if (!s.connected && !this.isConnecting) {
      this.isConnecting = true;
      s.connect();
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
    console.log("CommentSocketManager reset completed");
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
      apiBaseUrl: API_BASE_URL,
    };
  }

  // Tour room management
  joinTour(tourId: string | number) {
    const s = this.getSocket();
    if (!s.connected) return;
    const tour_id = typeof tourId === "number" ? tourId : parseInt(tourId);
    if (isNaN(tour_id)) {
      console.error("Invalid tour_id:", tourId);
      return;
    }
    s.emit("joinTour", { tour_id });
    console.log("Joined tour room:", tour_id);
  }

  leaveTour(tourId: string | number) {
    const s = this.getSocket();
    if (!s.connected) return;
    const roomId = String(tourId);
    s.emit("leave", roomId);
    console.log("Left tour room:", roomId);
  }

  // Emits
  emitSendComment(data: CommentPayload) {
    const s = this.getSocket();
    if (!s.connected) return;
    s.emit("sendComment", {
      id: data.id,
      user: data.user,
      tour_id: data.tour_id,
      text: data.text,
      parent_question_id: data.parent_question_id,
      reported: data.reported,
    });
  }

  emitSendDelete(data: DeleteCommentPayload) {
    const s = this.getSocket();
    if (!s.connected) return;
    s.emit("sendDelete", {
      id: data.id,
      tour_id: data.tour_id,
    });
  }

  // Listeners
  onReceiveComment(
    handler: (data: CommentReceivedPayload) => void
  ) {
    const s = this.getSocket();
    s.on("receiveComment", handler);
  }

  offReceiveComment(
    handler?: (data: CommentReceivedPayload) => void
  ) {
    const s = this.getSocket();
    if (handler) s.off("receiveComment", handler);
    else s.off("receiveComment");
  }

  onReceiveDelete(
    handler: (id: number) => void
  ) {
    const s = this.getSocket();
    s.on("receiveDelete", handler);
  }

  offReceiveDelete(
    handler?: (id: number) => void
  ) {
    const s = this.getSocket();
    if (handler) s.off("receiveDelete", handler);
    else s.off("receiveDelete");
  }
}

// Factory function để tạo instance mới
export const createCommentSocketManager = (): CommentSocketManager => {
  return new CommentSocketManager();
};

// Global instance cho backward compatibility (không khuyến khích dùng)
let globalCommentManager: CommentSocketManager | null = null;

export const getGlobalCommentManager = (): CommentSocketManager => {
  if (!globalCommentManager) {
    globalCommentManager = new CommentSocketManager();
  }
  return globalCommentManager;
};

// Backward compatibility functions (sử dụng global instance)
export const getCommentSocket = (): Socket => {
  return getGlobalCommentManager().getSocket();
};

export const getCommentSocketStatus = () => {
  return getGlobalCommentManager().getStatus();
};

export const isCommentSocketConnected = (): boolean => {
  return getGlobalCommentManager().isConnected();
};

export const connectCommentSocket = () => {
  getGlobalCommentManager().connect();
};

export const disconnectCommentSocket = () => {
  getGlobalCommentManager().disconnect();
};

export const resetCommentSocket = () => {
  getGlobalCommentManager().reset();
};

export const getCommentDebugInfo = () => {
  return getGlobalCommentManager().getDebugInfo();
};

// Tour room management
export const joinTour = (tourId: string | number) => {
  getGlobalCommentManager().joinTour(tourId);
};

export const leaveTour = (tourId: string | number) => {
  getGlobalCommentManager().leaveTour(tourId);
};

// Emits
export const emitSendComment = (data: CommentPayload) => {
  getGlobalCommentManager().emitSendComment(data);
};

export const emitSendDelete = (data: DeleteCommentPayload) => {
  getGlobalCommentManager().emitSendDelete(data);
};

// Listeners
export const onReceiveComment = (
  handler: (data: CommentReceivedPayload) => void
) => {
  getGlobalCommentManager().onReceiveComment(handler);
};

export const offReceiveComment = (
  handler?: (data: CommentReceivedPayload) => void
) => {
  getGlobalCommentManager().offReceiveComment(handler);
};

export const onReceiveDelete = (
  handler: (id: number) => void
) => {
  getGlobalCommentManager().onReceiveDelete(handler);
};

export const offReceiveDelete = (
  handler?: (id: number) => void
) => {
  getGlobalCommentManager().offReceiveDelete(handler);
};

