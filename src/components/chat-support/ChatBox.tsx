import React, { useRef, useState, useEffect } from "react";
import { Send, Loader2, MoreVertical, User, Image, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { TypingLoader } from "../ui/typing";

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

interface ChatBoxProps {
  conversation: {
    id: number;
    user_id: number;
    provider_id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    partner_presence?: {
      online: boolean;
      lastOfflineAt?: string | null;
    };
  } | null;
  messages: Array<{
    id: number | string;
    text: string;
    sender: "user" | "provider";
    time: string;
    status: "sending" | "sent" | "read" | "failed";
    image_url: string;
  }>;
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: (imageFile?: File) => void;
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  isSending: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  actor: "user" | "provider";
  newProviderId?: number;
  isPeerTyping?: boolean;
  peerTypingText?: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({
  conversation,
  messages,
  messageInput,
  onMessageInputChange,
  onSendMessage,
  onScroll,
  isSending,
  isLoading,
  isLoadingMore,
  actor,
  newProviderId,
  isPeerTyping,
  peerTypingText,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [timeUpdateTrigger, setTimeUpdateTrigger] = useState(0);

  // Cập nhật thời gian mỗi phút
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeUpdateTrigger((prev) => prev + 1);
    }, 60000); // 60000ms = 1 phút

    return () => clearInterval(interval);
  }, []);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    onSendMessage(selectedImage || undefined);
    handleRemoveImage();
  };

  const isNewConversation = conversation?.id === 0 || newProviderId;

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-orange-50 to-white">
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            Chọn một cuộc trò chuyện
          </h3>
          <p className="text-sm text-slate-500">
            Chọn một cuộc trò chuyện từ danh sách bên trái để bắt đầu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            {conversation.avatar ? (
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-200 to-orange-300 flex items-center justify-center">
                <User className="w-6 h-6 text-orange-700" />
              </div>
            )}
            {conversation.partner_presence?.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">
              {conversation.name}
            </h3>
            <p
              className="text-xs text-slate-500"
              key={`presence-${timeUpdateTrigger}`}
            >
              {conversation.partner_presence?.online
                ? "Đang hoạt động"
                : conversation?.partner_presence?.lastOfflineAt
                ? formatRelativeTime(
                    conversation.partner_presence.lastOfflineAt
                  )
                : "Không hoạt động"}
            </p>
          </div>
        </div>
        <button
          className="p-2 hover:bg-orange-100 rounded-full transition-colors"
          title="Tùy chọn"
          aria-label="Tùy chọn"
        >
          <MoreVertical className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={onScroll}
        data-messages-container
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-slate-50 to-white"
      >
        {isLoadingMore && (
          <div className="flex justify-center py-2">
            <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
          </div>
        )}

        {isLoading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : messages.length === 0 && isNewConversation ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Bắt đầu cuộc trò chuyện
              </h3>
              <p className="text-sm text-slate-500">
                Gửi tin nhắn đầu tiên của bạn tới {conversation.name}
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-slate-500">Chưa có tin nhắn nào</p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isSentByMe={message.sender === actor}
              peerAvatar={conversation.avatar}
            />
          ))
        )}
        {isPeerTyping ? <TypingLoader isAdmin={false} /> : null}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-orange-100 bg-white">
        {/* Image Preview */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-20 object-cover rounded-lg border-2 border-orange-200"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Xóa hình ảnh"
              aria-label="Xóa hình ảnh"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
            title="Chọn hình ảnh"
            aria-label="Chọn hình ảnh"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-orange-50 rounded-full transition-colors text-slate-600"
            disabled={isSending}
            title="Gửi hình ảnh"
            aria-label="Gửi hình ảnh"
          >
            <Image className="w-5 h-5" />
          </button>
          <input
            type="text"
            placeholder="Nhập tin nhắn..."
            value={messageInput}
            onChange={(e) => onMessageInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-orange-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-slate-50 text-slate-800 placeholder-slate-400"
            disabled={isSending}
          />
          <button
            onClick={handleSend}
            disabled={isSending || (!messageInput.trim() && !selectedImage)}
            className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
