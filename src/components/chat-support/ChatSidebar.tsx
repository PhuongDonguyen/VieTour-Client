import React from "react";
import { Search, Loader2, User } from "lucide-react";

interface ChatSidebarProps {
  conversations: Array<{
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
  }>;
  selectedConversationId: number | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchEnter?: (query: string) => void; // optional: server-side search trigger on Enter
  onExitSearch?: () => void; // optional: exit search mode
  isSearchMode?: boolean;
  onConversationSelect: (id: number, providerId: number) => void;
  isLoading: boolean;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  selectedConversationId,
  searchQuery,
  onSearchChange,
  onSearchEnter,
  onExitSearch,
  isSearchMode,
  onConversationSelect,
  isLoading,
}) => {
  // If onSearchEnter is provided, assume server-side search; render given conversations directly.
  // Otherwise, fallback to client-side filter by name.
  const filteredConversations = onSearchEnter
    ? conversations
    : conversations.filter((conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-orange-100 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-orange-100">
        <h2 className="text-xl font-bold text-orange-800 mb-3">Gần đây</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && onSearchEnter) {
                onSearchEnter(searchQuery);
              }
            }}
            className="w-full pl-10 pr-16 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent bg-white text-slate-800 placeholder-slate-400"
          />
          {isSearchMode && onExitSearch && (
            <button
              type="button"
              onClick={onExitSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded"
              title="Thoát tìm kiếm"
              aria-label="Thoát tìm kiếm"
            >
              Thoát
            </button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500">
            <p className="text-sm">Không tìm thấy cuộc trò chuyện</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() =>
                onConversationSelect(conversation.id, conversation.provider_id)
              }
              className={`w-full p-4 flex items-start gap-3 hover:bg-orange-50 transition-colors border-b border-orange-50 ${
                selectedConversationId === conversation.id
                  ? "bg-orange-100 border-l-4 border-l-orange-500"
                  : ""
              }`}
            >
              {/* Avatar with fallback */}
              <div className="relative flex-shrink-0">
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

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-slate-800 truncate">
                    {conversation.name}
                  </h3>
                  <span className="text-xs text-slate-500 ml-2 flex-shrink-0">
                    {conversation.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-600 truncate flex-1">
                    {conversation.lastMessage}
                  </p>
                  {conversation.unread > 0 && (
                    <span className="ml-2 flex-shrink-0 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                      {conversation.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
