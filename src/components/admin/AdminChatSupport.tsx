import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { getConversations, Conversation } from '../../apis/conversation.api';
import { getMessagesByConversation, sendMessage, Message } from '../../apis/message.api';
import { Send, MessageCircle, Clock, User, Search, MoreVertical, Paperclip, Smile, Store } from 'lucide-react';

const AdminChatSupport: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsPage, setConversationsPage] = useState(1);
  const [conversationsHasMore, setConversationsHasMore] = useState(true);
  const [conversationsLoadingMore, setConversationsLoadingMore] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesByConversation, setMessagesByConversation] = useState<Record<number, Message[]>>({});
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const conversationsContainerRef = useRef<HTMLDivElement>(null);
  const [pageByConversation, setPageByConversation] = useState<Record<number, number>>({});
  const [hasMoreByConversation, setHasMoreByConversation] = useState<Record<number, boolean>>({});
  const [loadingMoreByConversation, setLoadingMoreByConversation] = useState<Record<number, boolean>>({});

  const waitForImagesInContainer = async (container: HTMLDivElement | null) => {
    if (!container) return;
    const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
    const pending = images.filter(img => !img.complete);
    if (pending.length === 0) return;
    await Promise.all(
      pending.map(img => new Promise<void>(resolve => {
        img.addEventListener('load', () => resolve(), { once: true });
        img.addEventListener('error', () => resolve(), { once: true });
      }))
    );
  };

  // Lấy danh sách cuộc trò chuyện
  const fetchConversations = async (page: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      const response = await getConversations(page, 20);
      console.log("Conversations: ",response.data);
      setConversations(prev => append ? [...prev, ...response.data] : response.data);
      setConversationsPage(page);
      const hasMore = !!response.pagination?.hasNextPage;
      setConversationsHasMore(hasMore);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cuộc trò chuyện:', error);
    } finally {
      setLoading(false);
    }
  };

  // Lấy tin nhắn của cuộc trò chuyện được chọn
  const fetchMessages = async (conversationId: number) => {
    console.log("Fetching messages for conversation: ", conversationId);
    try {
      // Nếu đã có cache, dùng cache và không gọi API
      const cached = messagesByConversation[conversationId];
      if (cached && cached.length) {
        setMessages(cached);
        return;
      }
      setMessagesLoading(true);
      const response = await getMessagesByConversation({
        conversation_id: conversationId,
        page: 1,
        limit: 20
      });
      console.log("Messages: ",response.data);
      // API trả mới -> cũ, cần đảo thành cũ -> mới để tin nhắn mới nhất nằm dưới
      const ordered = (response.data || []).slice().reverse();
      setMessages(ordered);
      setMessagesByConversation(prev => ({ ...prev, [conversationId]: ordered }));
      setPageByConversation(prev => ({ ...prev, [conversationId]: 1 }));
      const hasMore = !!(response as any)?.pagination?.hasNextPage || (response.data?.length >= 20);
      setHasMoreByConversation(prev => ({ ...prev, [conversationId]: hasMore }));
    } catch (error) {
      console.error('Lỗi khi lấy tin nhắn:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const loadMoreOlderMessages = async (conversationId: number) => {
    try {
      if (loadingMoreByConversation[conversationId]) return;
      if (!hasMoreByConversation[conversationId]) return;

      const container = messagesContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;

      setLoadingMoreByConversation(prev => ({ ...prev, [conversationId]: true }));
      const nextPage = (pageByConversation[conversationId] || 1) + 1;
      const response = await getMessagesByConversation({
        conversation_id: conversationId,
        page: nextPage,
        limit: 20,
      });
      const olderOrdered = (response.data || []).slice().reverse();
      setMessages(prev => {
        const updated = [...olderOrdered, ...prev];
        setMessagesByConversation(map => ({ ...map, [conversationId]: updated }));
        return updated;
      });
      setPageByConversation(prev => ({ ...prev, [conversationId]: nextPage }));
      const hasMore = !!(response as any)?.pagination?.hasNextPage || (response.data?.length >= 20);
      setHasMoreByConversation(prev => ({ ...prev, [conversationId]: hasMore }));

      // giữ vị trí cuộn sau khi prepend: double rAF + chờ ảnh render xong
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          (async () => {
            await waitForImagesInContainer(messagesContainerRef.current);
            const el = messagesContainerRef.current;
            if (el) {
              const newScrollHeight = el.scrollHeight;
              el.scrollTop = newScrollHeight - prevScrollHeight;
            }
          })();
        });
      });
    } catch (error) {
      console.error('Lỗi khi tải thêm tin nhắn:', error);
    } finally {
      setLoadingMoreByConversation(prev => ({ ...prev, [conversationId]: false }));
    }
  };

  // Gửi tin nhắn mới
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || sendingMessage) return;

    try {
      setSendingMessage(true);
      const response = await sendMessage({
        conversation_id: selectedConversation.id,
        message_text: newMessage.trim()
      });
      
      // Thêm tin nhắn mới vào danh sách và cache theo hội thoại + gắn vào conversation hiện tại
      setMessages(prev => {
        const updated = [...prev, response.data];
        setMessagesByConversation(m => ({ ...m, [selectedConversation.id]: updated }));
        // Gắn messages vào selectedConversation trong danh sách hội thoại (nếu có)
        setConversations(list => list.map(c => (c.id === selectedConversation.id ? ({ ...(c as any), messages: updated }) : c)));
        return updated;
      });
      setNewMessage('');
      
      // Cập nhật metadata cuộc trò chuyện cục bộ, không reload toàn bộ
      setConversations(prev => prev.map(c => {
        if (c.id !== selectedConversation.id) return c;
        return {
          ...c,
          last_message_text: response.data.message_text ?? '',
          last_message_at: response.data.created_at,
        } as any;
      }));
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Xử lý khi chọn cuộc trò chuyện
  const handleSelectConversation = (conversation: Conversation) => {
    // Nếu chọn lại cùng hội thoại thì bỏ qua
    if (selectedConversation?.id === conversation.id) return;
    setSelectedConversation(conversation);
    // Nếu conversation đã có messages kèm theo, dùng trực tiếp và cache
    const inlineMessages = (conversation as any)?.messages as Message[] | undefined;
    if (inlineMessages && inlineMessages.length) {
      setMessages([...inlineMessages]);
      setMessagesByConversation(prev => ({ ...prev, [conversation.id]: [...inlineMessages] }));
      requestAnimationFrame(() => {
        scrollToBottom();
        setTimeout(scrollToBottom, 120);
        setTimeout(scrollToBottom, 300);
      });
      return;
    }
    // Nếu có cache thì set ngay, nếu không thì fetch
    const cached = messagesByConversation[conversation.id];
    if (cached && cached.length) {
      // clone để kích hoạt render và effect
      setMessages([...cached]);
      // đảm bảo kéo xuống đáy
      requestAnimationFrame(() => {
        scrollToBottom();
        setTimeout(scrollToBottom, 120);
        setTimeout(scrollToBottom, 300);
      });
      return;
    }
    fetchMessages(conversation.id);
  };

  // Khi đổi hội thoại, đảm bảo auto scroll xuống đáy sau khi render
  useEffect(() => {
    if (!selectedConversation) return;
    requestAnimationFrame(() => {
      scrollToBottom();
      setTimeout(scrollToBottom, 120);
      setTimeout(scrollToBottom, 300);
    });
  }, [selectedConversation]);

  // Cuộn xuống cuối danh sách tin nhắn
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
  };

  // Xử lý phím Enter để gửi tin nhắn
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format thời gian
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format thời gian ngắn gọn theo kiểu tương đối: "Vừa xong", "X phút trước", "X giờ trước", "X ngày trước", hoặc dd/MM
  const formatShortTime = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 45) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHour < 24) return `${diffHour} giờ trước`;
    if (diffDay < 7) return `${diffDay} ngày trước`;
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  useEffect(() => {
    fetchConversations(1, false);
  }, []);

  const loadMoreConversations = async () => {
    try {
      if (conversationsLoadingMore) return;
      if (!conversationsHasMore) return;
      if (searchQuery.trim()) return; // bỏ qua khi đang tìm kiếm
      setConversationsLoadingMore(true);
      const nextPage = conversationsPage + 1;
      await fetchConversations(nextPage, true);
    } catch (error) {
      console.error('Lỗi khi tải thêm cuộc trò chuyện:', error);
    } finally {
      setConversationsLoadingMore(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getDisplayName = (c: Conversation) => {
    const userProfile = (c as any)?.user?.user_profile || (c as any)?.user_profile;
    const providerProfile = (c as any)?.provider?.provider_profile || (c as any)?.provider_profile;
    const userName = userProfile ? `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() : '';
    const providerName = providerProfile?.company_name || '';
    // Ưu tiên tên user nếu có, nếu không thì tên provider
    return userName || providerName || `User ${c.user_id || (c as any)?.user?.id || c.provider_id || (c as any)?.provider?.id}`;
  };

  const filteredConversations = conversations.filter((c) => {
    const name = getDisplayName(c);
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex h-[calc(100vh-200px)] p-6 gap-4">
      {/* Danh sách cuộc trò chuyện */}
      <Card className="w-1/3 min-w-[300px]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-gray-700" />
            <span className="text-gray-900">Tin Nhắn Của Tôi</span>
          </CardTitle>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm nhà cung cấp..."
              className="pl-9 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div ref={conversationsContainerRef} className="max-h-[calc(100vh-300px)] overflow-y-auto" onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 8) {
              loadMoreConversations();
            }
          }}>
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Đang tải...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Chưa có cuộc trò chuyện nào
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-gray-50 border-l-4 border-l-gray-900' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      {((conversation as any)?.user?.user_profile?.avatar) ? (
                        <img
                          src={(conversation as any).user.user_profile.avatar}
                          alt="avatar"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                      )}
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gray-400 ring-2 ring-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-gray-900 truncate">
                          {getDisplayName(conversation)}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">{formatShortTime(conversation.last_message_at)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-600 truncate">{conversation.last_message_text}</p>
                        {conversation.unread_count_provider > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full font-semibold">
                            {conversation.unread_count_provider}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {conversationsLoadingMore && (
              <div className="p-3 text-center text-gray-500">Đang tải thêm...</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Khu vực chat */}
      <Card className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header cuộc trò chuyện */}
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                    {((selectedConversation as any)?.user?.user_profile?.avatar) ? (
                      <img
                        src={(selectedConversation as any).user.user_profile.avatar}
                        alt="avatar"
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-gray-400 ring-2 ring-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center gap-2">
                      {getDisplayName(selectedConversation)}
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Store className="w-3 h-3" />
                        Khách hàng
                      </span>
                    </div>
                    <div className="text-sm flex items-center gap-2">
                      <span className="text-gray-600">Đang hoạt động</span>
                      <span className="text-gray-400">•</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </Button>
              </div>
            </CardHeader>

            {/* Danh sách tin nhắn */}
            <CardContent className="flex-1 p-0 overflow-hidden">
              <div ref={messagesContainerRef} className="h-full max-h-[calc(100vh-400px)] overflow-y-auto p-4 space-y-4" onScroll={(e) => {
                const el = e.currentTarget;
                if (!selectedConversation) return;
                const convId = selectedConversation.id;
                if (el.scrollTop <= 0) {
                  loadMoreOlderMessages(convId);
                }
              }}>
                {messagesLoading ? (
                  <div className="text-center text-gray-500">
                    Đang tải tin nhắn...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500">
                    Chưa có tin nhắn nào
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.sender_id === selectedConversation.provider_id
                          ? 'justify-end'
                          : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl overflow-hidden border ${message.sender_id === selectedConversation.provider_id ? 'border-gray-900' : 'border-gray-300'}`}
                      >
                        {message.message_text && (
                          <div className={`bg-white text-gray-900 px-4 py-2.5`}>
                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.message_text}</p>
                          </div>
                        )}
                        {message.image_url && (
                          <img
                            src={message.image_url}
                            alt="Tin nhắn hình ảnh"
                            className="max-w-[260px] max-h-[240px] w-full object-cover block"
                          />
                        )}
                        <div className={`flex items-center gap-2 px-3 py-1 ${message.sender_id === selectedConversation.provider_id ? 'justify-end' : ''}`}>
                          <span className="text-[11px] text-gray-500">{formatTime(message.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Form gửi tin nhắn */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 min-h-[40px] max-h-[120px] resize-none"
                  disabled={sendingMessage}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Chọn một cuộc trò chuyện để bắt đầu</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AdminChatSupport;

