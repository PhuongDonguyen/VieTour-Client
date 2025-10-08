import React, { useMemo } from 'react';
import { ChatSidebar } from './ChatSidebar';
import { ChatBox } from './ChatBox';
import { useChatSupport } from './useChatSupport';
import { useAuth } from '@/hooks/useAuth';
import type { Conversation } from '@/apis/conversation.api';

export const ChatSupport: React.FC = () => {
    const { user } = useAuth();

    const actor: 'user' | 'provider' = user?.role === 'provider' ? 'provider' : 'user';

    const getPeerDisplay = useMemo(() => {
        if (actor === 'user') {
            return (conv: Conversation) => {
                const providerProfile = conv.provider?.provider_profile;
                return {
                    name: providerProfile?.company_name || '',
                    avatar: providerProfile?.avatar || '',
                };
            };
        } else {
            return (conv: Conversation) => {
                const userProfile = conv.user?.user_profile;
                const fullName = userProfile
                    ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
                    : '';
                return {
                    name: fullName,
                    avatar: userProfile?.avatar || '',
                };
            };
        }
    }, [actor]);

    const {
        conversations,
        selectedConversation,
        selectedConversationId,
        messages,
        messageInput,
        searchQuery,
        isConversationsLoading,
        isMessagesLoading,
        isLoadingMore,
        isSending,
        setMessageInput,
        setSearchQuery,
        handleConversationSelect,
        handleSendMessage,
        handleMessagesScroll,
    } = useChatSupport(actor, getPeerDisplay);

    return (
        <div className="min-h-screen bg-slate-50 pt-20 pb-8">
            <div className="container mx-auto px-4">
                <div className="h-[calc(100vh-12rem)] md:h-[calc(100vh-10rem)] lg:h-[calc(100vh-8rem)] min-h-[600px] max-h-[900px] flex max-w-7xl mx-auto mb-1 bg-gradient-to-br border border-orange-200 rounded shadow-lg">
                    <ChatSidebar
                        conversations={conversations}
                        selectedConversationId={selectedConversationId}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onConversationSelect={handleConversationSelect}
                        isLoading={isConversationsLoading}
                    />

                    <ChatBox
                        conversation={selectedConversation}
                        messages={messages}
                        messageInput={messageInput}
                        onMessageInputChange={setMessageInput}
                        onSendMessage={handleSendMessage}
                        onScroll={handleMessagesScroll}
                        isSending={isSending}
                        isLoading={isMessagesLoading}
                        isLoadingMore={isLoadingMore}
                        actor={actor}
                    />
                </div>
            </div>
        </div>
    );
};