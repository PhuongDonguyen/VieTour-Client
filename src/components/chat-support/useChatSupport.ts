import { useState, useCallback, useRef, useEffect } from 'react';
import { fetchConversations, markAsReadByUser, markAsReadByProvider } from '@/services/conversation.service';
import { fetchMessagesByConversation, createMessage } from '@/services/message.service';
import type { Conversation } from '@/apis/conversation.api';
import type { Message } from '@/apis/message.api';

type ChatActor = 'user' | 'provider';

interface UIMessage {
    id: number | string;
    text: string;
    sender: 'user' | 'provider';
    time: string;
    status: 'sending' | 'sent' | 'read' | 'failed';
    image_url: string;
}

interface UIConversation {
    id: number;
    user_id: number;
    provider_id: number;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    status: 'online' | 'offline';
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

    const timePart = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    if (isSameDay) return timePart;

    const datePart = d.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return `${timePart} ${datePart}`;
};

const formatRelativeTime = (dateInput: string | Date): string => {
    if (!dateInput) return '';

    const d = new Date(dateInput);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;

    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const getPeerInfoFromConversation = (
    conv: Conversation,
    actor: ChatActor,
    customGetter?: (conv: Conversation) => PeerDisplay
): PeerDisplay => {
    if (customGetter) {
        return customGetter(conv);
    }

    if (actor === 'user') {
        const providerProfile = conv.provider?.provider_profile;
        return {
            name: providerProfile?.company_name || '',
            avatar: providerProfile?.avatar || '',
        };
    } else {
        const userProfile = conv.user?.user_profile;
        const fullName = userProfile
            ? `${userProfile.first_name} ${userProfile.last_name}`.trim()
            : '';
        return {
            name: fullName,
            avatar: userProfile?.avatar || '',
        };
    }
};

export const useChatSupport = (
    actor: ChatActor,
    getPeerDisplay?: (conv: Conversation) => PeerDisplay
) => {
    const [conversations, setConversations] = useState<UIConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<number | null>(null);
    const [messagesByConversation, setMessagesByConversation] = useState<Record<number, UIMessage[]>>({});
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const [isConversationsLoading, setIsConversationsLoading] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState<Record<number, boolean>>({});
    const [loadingMore, setLoadingMore] = useState<Record<number, boolean>>({});
    const [isSending, setIsSending] = useState(false);

    const [pageByConversation, setPageByConversation] = useState<Record<number, number>>({});
    const [hasMoreByConversation, setHasMoreByConversation] = useState<Record<number, boolean>>({});

    const skipAutoScrollRef = useRef(false);

    const selectedConversation = selectedConversationId !== null
        ? conversations.find(c => c.id === selectedConversationId) || null
        : null;

    const mapApiMessageToUI = useCallback((
        apiMessage: Message,
        userId: number,
        providerId: number
    ): UIMessage => {
        const isUserMessage = apiMessage.sender_id === userId;

        let status: UIMessage['status'] = 'read';
        if (isUserMessage) {
            status = apiMessage.is_read ? 'read' : 'sent';
        }

        return {
            id: apiMessage.id,
            text: apiMessage.message_text || '',
            sender: isUserMessage ? 'user' : 'provider',
            time: formatDisplayTime(apiMessage.created_at),
            status,
            image_url: apiMessage.image_url || '',
        };
    }, []);

    const loadConversations = useCallback(async () => {
        try {
            setIsConversationsLoading(true);
            const res = await fetchConversations(1, 20);

            if (res.success && res.data) {
                const mappedConversations: UIConversation[] = res.data.map((conv) => {
                    const peer = getPeerInfoFromConversation(conv, actor, getPeerDisplay);

                    return {
                        id: conv.id,
                        user_id: conv.user_id,
                        provider_id: conv.provider_id,
                        name: peer.name,
                        avatar: peer.avatar,
                        lastMessage: conv.last_message_text || '',
                        time: formatRelativeTime(conv.last_message_at),
                        unread: actor === 'user' ? conv.unread_count_user : conv.unread_count_provider,
                        status: 'online',
                    };
                });

                setConversations(mappedConversations);

                // Auto-select the first (latest) conversation
                if (mappedConversations.length > 0) {
                    const latestConversation = mappedConversations[0];
                    setSelectedConversationId(latestConversation.id);

                    // Load messages for the latest conversation
                    await loadMessages(latestConversation.id);

                    // Mark as read if there are unread messages
                    if (latestConversation.unread > 0) {
                        try {
                            if (actor === 'user') {
                                await markAsReadByUser(latestConversation.id);
                            } else {
                                await markAsReadByProvider(latestConversation.id);
                            }

                            setConversations(prev =>
                                prev.map(c => (c.id === latestConversation.id ? { ...c, unread: 0 } : c))
                            );
                        } catch (error) {
                            console.error('Error marking as read:', error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
        } finally {
            setIsConversationsLoading(false);
        }
    }, [actor, getPeerDisplay]);

    const loadMessages = useCallback(async (conversationId: number, page: number = 1) => {
        try {
            if (page === 1 && messagesByConversation[conversationId]?.length > 0) {
                return;
            }

            if (page === 1) {
                setLoadingMessages(prev => ({ ...prev, [conversationId]: true }));
            } else {
                setLoadingMore(prev => ({ ...prev, [conversationId]: true }));
            }

            const res = await fetchMessagesByConversation({
                conversation_id: conversationId,
                page,
                limit: 20,
            });

            if (res.success) {
                const conv = conversations.find(c => c.id === conversationId);
                if (!conv) return;

                const orderedMessages = [...res.data].reverse();
                const mappedMessages = orderedMessages.map(msg =>
                    mapApiMessageToUI(msg, conv.user_id, conv.provider_id)
                );

                setMessagesByConversation(prev => {
                    if (page === 1) {
                        return { ...prev, [conversationId]: mappedMessages };
                    } else {
                        const existing = prev[conversationId] || [];
                        return { ...prev, [conversationId]: [...mappedMessages, ...existing] };
                    }
                });

                setPageByConversation(prev => ({ ...prev, [conversationId]: page }));
                setHasMoreByConversation(prev => ({
                    ...prev,
                    [conversationId]: res.pagination?.hasNextPage || false,
                }));

                if (page > 1) {
                    skipAutoScrollRef.current = false;
                }
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        } finally {
            setLoadingMessages(prev => ({ ...prev, [conversationId]: false }));
            setLoadingMore(prev => ({ ...prev, [conversationId]: false }));
        }
    }, [conversations, messagesByConversation, mapApiMessageToUI]);

    const loadMoreMessages = useCallback(async (conversationId: number) => {
        if (loadingMore[conversationId]) return;
        if (!hasMoreByConversation[conversationId]) return;

        skipAutoScrollRef.current = true;
        const nextPage = (pageByConversation[conversationId] || 1) + 1;
        await loadMessages(conversationId, nextPage);
    }, [loadingMore, hasMoreByConversation, pageByConversation, loadMessages]);

    const handleConversationSelect = useCallback(async (conversationId: number) => {
        const conv = conversations.find(c => c.id === conversationId);
        if (!conv) return;

        setSelectedConversationId(conversationId);
        await loadMessages(conversationId);

        if (conv.unread > 0) {
            try {
                if (actor === 'user') {
                    await markAsReadByUser(conversationId);
                } else {
                    await markAsReadByProvider(conversationId);
                }

                setConversations(prev =>
                    prev.map(c => (c.id === conversationId ? { ...c, unread: 0 } : c))
                );
            } catch (error) {
                console.error('Error marking as read:', error);
            }
        }
    }, [conversations, loadMessages, actor]);

    const handleSendMessage = useCallback(async () => {
        if (!selectedConversation) return;
        if (isSending) return;

        const text = messageInput.trim();
        if (!text) return;

        const conversationId = selectedConversation.id;

        try {
            setIsSending(true);

            const tempId = `temp-${Date.now()}`;
            const tempMessage: UIMessage = {
                id: tempId,
                text,
                sender: actor,
                time: '',
                status: 'sending',
                image_url: '',
            };

            setMessagesByConversation(prev => ({
                ...prev,
                [conversationId]: [...(prev[conversationId] || []), tempMessage],
            }));

            const res = await createMessage({
                conversation_id: conversationId,
                message_text: text,
            });

            const sentMessage: UIMessage = {
                id: res.data.id,
                text: res.data.message_text || text,
                sender: actor,
                time: formatDisplayTime(res.data.created_at),
                status: 'sent',
                image_url: res.data.image_url || '',
            };

            setMessagesByConversation(prev => ({
                ...prev,
                [conversationId]: prev[conversationId].map(m =>
                    m.id === tempId ? sentMessage : m
                ),
            }));

            setConversations(prev =>
                prev.map(c =>
                    c.id === conversationId
                        ? { ...c, lastMessage: text, time: 'Vừa xong' }
                        : c
                )
            );

            setMessageInput('');
        } catch (error) {
            console.error('Error sending message:', error);

            setMessagesByConversation(prev => ({
                ...prev,
                [conversationId]: prev[conversationId].map(m =>
                    typeof m.id === 'string' && m.id.startsWith('temp-') && m.text === text
                        ? { ...m, status: 'failed' }
                        : m
                ),
            }));
        } finally {
            setIsSending(false);
        }
    }, [selectedConversation, isSending, messageInput, actor]);

    const handleMessagesScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        if (!selectedConversation) return;

        const el = e.currentTarget;
        if (el.scrollTop <= 50) {
            loadMoreMessages(selectedConversation.id);
        }
    }, [selectedConversation, loadMoreMessages]);

    useEffect(() => {
        loadConversations();
    }, [loadConversations]);

    return {
        conversations,
        selectedConversation,
        selectedConversationId,
        messages: selectedConversation ? messagesByConversation[selectedConversation.id] || [] : [],
        messageInput,
        searchQuery,
        isConversationsLoading,
        isMessagesLoading: selectedConversation ? loadingMessages[selectedConversation.id] || false : false,
        isLoadingMore: selectedConversation ? loadingMore[selectedConversation.id] || false : false,
        isSending,
        setMessageInput,
        setSearchQuery,
        handleConversationSelect,
        handleSendMessage,
        handleMessagesScroll,
        actor,
    };
};