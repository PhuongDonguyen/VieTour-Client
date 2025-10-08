import React, { useRef } from 'react';
import { Send, Paperclip, Smile, MoreVertical, User } from 'lucide-react';
import { ChatMessage } from './ChatMessage';

interface ChatBoxProps {
    conversation: {
        id: number;
        name: string;
        avatar: string;
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
}) => {
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <ChatBoxHeader conversation={conversation} isLoading={!conversation} />

            {/* Messages Container */}
            <div
                ref={messagesContainerRef}
                onScroll={onScroll}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50"
            >
                {conversation && isLoadingMore && (
                    <div className="w-full flex justify-center py-2">
                        <div className="h-5 w-5 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                )}

                {isLoading && <MessagesSkeleton />}

                {conversation &&
                    !isLoading &&
                    messages.map((msg) => (
                        <ChatMessage
                            key={msg.id}
                            message={msg}
                            isSentByMe={msg.sender === actor}
                            peerAvatar={conversation.avatar}
                        />
                    ))}
            </div>

            {/* Input Area */}
            <ChatInput
                value={messageInput}
                onChange={onMessageInputChange}
                onSend={onSendMessage}
                onKeyDown={handleKeyDown}
                disabled={!conversation || isSending}
            />
        </div>
    );
};

const MessagesSkeleton: React.FC = () => {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Received message skeleton */}
            <div className="flex justify-start">
                <div className="flex items-end space-x-2 max-w-md">
                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                        <div className="h-16 w-64 bg-slate-200 rounded-2xl" />
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                    </div>
                </div>
            </div>

            {/* Sent message skeleton */}
            <div className="flex justify-end">
                <div className="space-y-2">
                    <div className="h-12 w-48 bg-orange-200 rounded-2xl" />
                    <div className="h-3 w-12 bg-slate-200 rounded ml-auto" />
                </div>
            </div>

            {/* Received message skeleton */}
            <div className="flex justify-start">
                <div className="flex items-end space-x-2 max-w-md">
                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                        <div className="h-20 w-72 bg-slate-200 rounded-2xl" />
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                    </div>
                </div>
            </div>

            {/* Sent message skeleton */}
            <div className="flex justify-end">
                <div className="space-y-2">
                    <div className="h-16 w-56 bg-orange-200 rounded-2xl" />
                    <div className="h-3 w-12 bg-slate-200 rounded ml-auto" />
                </div>
            </div>

            {/* Received message skeleton */}
            <div className="flex justify-start">
                <div className="flex items-end space-x-2 max-w-md">
                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                    <div className="space-y-2">
                        <div className="h-14 w-60 bg-slate-200 rounded-2xl" />
                        <div className="h-3 w-16 bg-slate-200 rounded" />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ChatBoxHeaderProps {
    conversation: {
        id: number;
        name: string;
        avatar: string;
        status: 'online' | 'offline';
    } | null;
    isLoading: boolean;
}

const ChatBoxHeader: React.FC<ChatBoxHeaderProps> = ({ conversation, isLoading }) => {
    if (isLoading) {
        return (
            <div className="bg-white border-b border-orange-200 p-4">
                <div className="flex items-center space-x-3 animate-pulse">
                    <div className="w-11 h-11 rounded-full bg-slate-200" />
                    <div className="h-5 w-32 bg-slate-200 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-b border-orange-200 p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center overflow-hidden">
                        {conversation?.avatar ? (
                            <img
                                src={conversation.avatar}
                                alt={conversation.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-6 h-6 text-orange-600" />
                        )}
                    </div>
                    <h3 className="font-semibold text-slate-800">
                        {conversation?.name}
                    </h3>
                </div>
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-slate-600" />
                </button>
            </div>
        </div>
    );
};

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    disabled: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
    value,
    onChange,
    onSend,
    onKeyDown,
    disabled,
}) => {
    return (
        <div className="bg-white border-t border-orange-200 p-4">
            <div className="flex items-center space-x-3">
                <button className="p-2.5 hover:bg-orange-100 rounded-lg transition-colors">
                    <Paperclip className="w-5 h-5 text-slate-600" />
                </button>
                <button className="p-2.5 hover:bg-orange-100 rounded-lg transition-colors">
                    <Smile className="w-5 h-5 text-slate-600" />
                </button>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Nhập tin nhắn..."
                    disabled={disabled}
                    className="flex-1 px-4 py-3 bg-slate-100 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all disabled:opacity-50"
                />
                <button
                    onClick={onSend}
                    disabled={disabled || !value.trim()}
                    className="p-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};