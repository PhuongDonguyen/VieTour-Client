import React, { useEffect, useRef } from 'react';
import { Send, Loader2, MoreVertical, User } from 'lucide-react';
import { ChatMessage } from './ChatMessage';

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
        status: 'online' | 'offline';
    } | null;
    messages: Array<{
        id: number | string;
        text: string;
        sender: 'user' | 'provider';
        time: string;
        status: 'sending' | 'sent' | 'read' | 'failed';
        image_url: string;
    }>;
    messageInput: string;
    onMessageInputChange: (value: string) => void;
    onSendMessage: () => void;
    onScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    isSending: boolean;
    isLoading: boolean;
    isLoadingMore: boolean;
    actor: 'user' | 'provider';
    newProviderId?: number;
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
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
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
                        {conversation.status === 'online' && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800">{conversation.name}</h3>
                        <p className="text-xs text-slate-500">
                            {conversation.status === 'online' ? 'Đang hoạt động' : 'Không hoạt động'}
                        </p>
                    </div>
                </div>
                <button className="p-2 hover:bg-orange-100 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5 text-slate-600" />
                </button>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                onScroll={onScroll}
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
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-orange-100 bg-white">
                <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-orange-50 rounded-full transition-colors text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                        </svg>
                    </button>
                    <button className="p-2 hover:bg-orange-50 rounded-full transition-colors text-slate-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
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
                        onClick={onSendMessage}
                        disabled={isSending || !messageInput.trim()}
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