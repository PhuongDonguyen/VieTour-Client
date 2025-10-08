import React from 'react';
import { Search } from 'lucide-react';

interface ChatSidebarProps {
    conversations: Array<{
        id: number;
        name: string;
        avatar: string;
        lastMessage: string;
        time: string;
        unread: number;
        status: 'online' | 'offline';
    }>;
    selectedConversationId: number | null;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onConversationSelect: (conversationId: number) => void;
    isLoading: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
    conversations,
    selectedConversationId,
    searchQuery,
    onSearchChange,
    onConversationSelect,
    isLoading,
}) => {
    const filteredConversations = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-96 bg-white border-r border-orange-200 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-orange-200 bg-white">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Tin Nhắn Của Tôi</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-orange-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
                {isLoading && (
                    <div className="p-6 flex justify-center">
                        <div className="h-6 w-6 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && filteredConversations.length === 0 && (
                    <div className="p-6 text-center text-slate-500">
                        {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Không có cuộc trò chuyện nào'}
                    </div>
                )}

                {filteredConversations.map((conv) => (
                    <ConversationItem
                        key={conv.id}
                        conversation={conv}
                        isSelected={selectedConversationId === conv.id}
                        onSelect={() => onConversationSelect(conv.id)}
                    />
                ))}
            </div>
        </div>
    );
};

interface ConversationItemProps {
    conversation: {
        id: number;
        name: string;
        avatar: string;
        lastMessage: string;
        time: string;
        unread: number;
        status: 'online' | 'offline';
    };
    isSelected: boolean;
    onSelect: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
    conversation,
    isSelected,
    onSelect,
}) => {
    return (
        <div
            onClick={onSelect}
            className={`p-4 border-b border-orange-100 cursor-pointer transition-all hover:bg-orange-50 ${isSelected ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                }`}
        >
            <div className="flex items-start space-x-3">
                <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl">
                        {conversation.avatar}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold text-slate-800 truncate">
                            {conversation.name}
                        </h3>
                        <span className="text-xs text-slate-500 ml-2">{conversation.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-600 truncate">
                            {conversation.lastMessage}
                        </p>
                        {conversation.unread > 0 && (
                            <span className="ml-2 px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full font-semibold">
                                {conversation.unread}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};