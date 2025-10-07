import React, { useEffect, useRef, useState } from 'react';
import { Send, User, Search, MoreVertical, Paperclip, Smile, Check, CheckCheck, Store } from 'lucide-react';
import { fetchConversations, markAsReadByUser, markAsReadByProvider } from '@/services/conversation.service';
import { fetchMessagesByConversation, createMessage } from '@/services/message.service';

type ChatActor = 'user' | 'provider';
type PeerDisplay = { name: string; avatar: string };
type ChatProps = {
  actor?: ChatActor; // 'user' (mặc định) hoặc 'provider'
  getPeerDisplay?: (conversation: any) => PeerDisplay; // custom lấy tên/avatar đối tác
};

export default function UserVendorChat({ actor = 'user', getPeerDisplay }: ChatProps) {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messagesByConversation, setMessagesByConversation] = useState<Record<number, any[]>>({});
  const [conversations, setConversations] = useState<any[]>([]);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConversationsLoading, setIsConversationsLoading] = useState(true);
  const skipAutoScrollRef = useRef(false);
  const [pageByConversation, setPageByConversation] = useState<Record<number, number>>({});
  const [hasMoreByConversation, setHasMoreByConversation] = useState<Record<number, boolean>>({});
  const [loadingMoreByConversation, setLoadingMoreByConversation] = useState<Record<number, boolean>>({});
  const [loadingByConversation, setLoadingByConversation] = useState<Record<number, boolean>>({});

  const formatDisplayTime = (dateInput: string | number | Date) => {
    const d = new Date(dateInput);
    const now = new Date();
    const isSameDay =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
    const timePart = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    if (isSameDay) return timePart;
    const datePart = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${timePart} ${datePart}`;
  };

  const waitForImagesInContainer = async (container: HTMLDivElement | null) => {
    if (!container) return;
    const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
    const pending = images.filter(img => !img.complete);
    if (pending.length === 0) return;
    await Promise.all(
      pending.map(
        img =>
          new Promise<void>(resolve => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          })
      )
    );
  };

  const scrollToBottom = () => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  };

  const loadMoreOlderMessages = async (conversationId: number) => {
    try {
      if (loadingMoreByConversation[conversationId]) return;
      if (!hasMoreByConversation[conversationId]) return;

      const container = messagesContainerRef.current;
      const prevScrollHeight = container?.scrollHeight || 0;
      // Bật cờ tránh auto scroll xuống đáy trong lúc prepend
      skipAutoScrollRef.current = true;
      setLoadingMoreByConversation(prev => ({ ...prev, [conversationId]: true }));
      const nextPage = (pageByConversation[conversationId] || 1) + 1;
      const res = await fetchMessagesByConversation({ conversation_id: conversationId, page: nextPage, limit: 10 });
      if (res.success) {
        const currentConv = conversations.find(c => c.id === conversationId);
        const userId = currentConv?.user_id;
        const providerId = currentConv?.provider_id;
        const ordered = (res.data || []).slice().reverse();
        const mapped = ordered.map((m: any) => {
          const isUserMessage = m.sender_id === userId;
          let status = 'read';
          if (isUserMessage) status = m.is_read ? 'read' : 'sent';
          return {
            id: m.id,
            text: m.message_text || '',
            sender: isUserMessage ? 'user' : (m.sender_id === providerId ? 'provider' : 'unknown'),
            time: formatDisplayTime(m.created_at),
            status,
            image_url: m.image_url || ''
          };
        });

        setMessagesByConversation(prev => {
          const existing = prev[conversationId] || [];
          return { ...prev, [conversationId]: [...mapped, ...existing] };
        });
        setPageByConversation(prev => ({ ...prev, [conversationId]: nextPage }));
        const hasMore = !!res.pagination?.hasNextPage;
        setHasMoreByConversation(prev => ({ ...prev, [conversationId]: hasMore }));

        // Giữ vị trí cuộn ổn định sau khi prepend: double rAF + chờ ảnh render xong
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            (async () => {
              await waitForImagesInContainer(messagesContainerRef.current);
              const el = messagesContainerRef.current;
              if (el) {
                const newScrollHeight = el.scrollHeight;
                el.scrollTop = newScrollHeight - prevScrollHeight;
              }
              // Tắt cờ để auto scroll hoạt động lại bình thường
              skipAutoScrollRef.current = false;
            })();
          });
        });
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setLoadingMoreByConversation(prev => ({ ...prev, [conversationId]: false }));
    }
  };

  // Auto-scroll sau khi tin nhắn đã được render
  useEffect(() => {
    if (selectedChat === null) return;
    if (skipAutoScrollRef.current) return; // đang prepend tin cũ, không auto scroll xuống
    scrollToBottom();
  }, [selectedChat, messagesByConversation]);

  const handleSendMessage = async () => {
    if (selectedChat === null) return;
    if (isSending) return;
    const text = messageInput.trim();
    if (!text) return;

    const conv = conversations[selectedChat];
    const conversationId = conv?.id;
    if (!conversationId) return;

    try {
      setIsSending(true);
      // 1) Thêm tin nhắn tạm thời ở UI
      const tempId = `temp-${Date.now()}`;
      const tempMsg = {
        id: tempId as any,
        text,
        sender: 'user',
        time: '',
        status: 'sending',
        image_url: ''
      };
      setMessagesByConversation(prev => {
        const list = prev[conversationId] || [];
        return { ...prev, [conversationId]: [...list, tempMsg] };
      });

      // 2) Gọi API gửi tin nhắn
      const res = await createMessage({ conversation_id: conversationId, message_text: text });
      const created = res.data;

      // 3) Thay thế tin nhắn tạm bằng tin nhắn thật và cập nhật trạng thái
      const sentMsg = {
        id: created.id,
        text: created.message_text || text,
        sender: 'user',
        time: new Date(created.created_at || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        image_url: created.image_url || ''
      };
      setMessagesByConversation(prev => {
        const list = (prev[conversationId] || []).map(m => (m.id === tempId ? sentMsg : m));
        return { ...prev, [conversationId]: list };
      });
      
      // 4) Cập nhật metadata conversation và clear input
      const updatedConversations = [...conversations];
      updatedConversations[selectedChat] = {
        ...updatedConversations[selectedChat],
        lastMessage: sentMsg.text,
        time: 'Vừa xong'
      };
      setConversations(updatedConversations);
      setMessageInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      // Đánh dấu failed cho tin nhắn tạm
      if (selectedChat !== null) {
        const conv = conversations[selectedChat];
        const conversationId = conv?.id;
        if (conversationId) {
          setMessagesByConversation(prev => {
            const list = (prev[conversationId] || []).map(m =>
              typeof m.id === 'string' && (m.id as string).startsWith('temp-') && m.text === text
                ? { ...m, status: 'failed' }
                : m
            );
            return { ...prev, [conversationId]: list };
          });
        }
      }
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsConversationsLoading(true);
        const res = await fetchConversations(1,10);
        console.log("res", res);
        
        if (res.success && res.data) {
          // Map conversations từ API response
          const mappedConversations = res.data.map((conv: any) => {
            const peer = getPeerDisplay
              ? getPeerDisplay(conv)
              : actor === 'user'
                ? { name: conv.provider_profile?.company_name || `Provider ${conv.provider_id}`, avatar: conv.provider_profile?.avatar || '🏢' }
                : { name: conv.user_profile?.full_name || `User ${conv.user_id}`, avatar: conv.user_profile?.avatar || '👤' };
            return {
            id: conv.id,
              user_id: conv.user_id,
              provider_id: conv.provider_id,
              name: peer.name,
              avatar: peer.avatar,
            lastMessage: conv.last_message_text,
              time: formatDisplayTime(conv.last_message_at),
              unread: actor === 'user' ? conv.unread_count_user : conv.unread_count_provider,
              status: 'online',
              messages: []
            };
          });
          
          setConversations(mappedConversations);
        }
        
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setIsConversationsLoading(false);
      } 
    }
    loadConversations();
  }, []);
  
  const loadMessagesForConversation = async (conversationId: number) => {
    try {
      // Tránh gọi lại nếu đã có tin nhắn trong state
      if (messagesByConversation[conversationId]?.length) return;

      setLoadingByConversation(prev => ({ ...prev, [conversationId]: true }));
      const res = await fetchMessagesByConversation({ conversation_id: conversationId, page: 1, limit: 10 });
      console.log("res", res);
      if (res.success) {
        // Lấy user_id và provider_id của conversation hiện tại để xác định người gửi
        const currentConv = conversations.find(c => c.id === conversationId);
        console.log("currentConv", currentConv);
        const userId = currentConv?.user_id;
        const providerId = currentConv?.provider_id;
        // Đảo ngược: API đang mới→cũ, cần cũ→mới để tin nhắn mới nhất nằm dưới
        const ordered = (res.data || []).slice().reverse();
        const mapped = ordered.map((m: any) => {
          const isUserMessage = m.sender_id === userId;
          let status = 'read'; // Mặc định cho provider messages
          
          if (isUserMessage) {
            // Tin nhắn của user: kiểm tra is_read
            status = m.is_read ? 'read' : 'sent';
          }
          
          return {
            id: m.id,
            text: m.message_text || '',
            sender: isUserMessage ? 'user' : (m.sender_id === providerId ? 'provider' : 'unknown'),
            time: formatDisplayTime(m.created_at),
            status,
            image_url: m.image_url || ''
          };
        });
        setMessagesByConversation(prev => ({ ...prev, [conversationId]: mapped }));
        setPageByConversation(prev => ({ ...prev, [conversationId]: 1 }));
        const hasMore = !!res.pagination?.hasNextPage;
        setHasMoreByConversation(prev => ({ ...prev, [conversationId]: hasMore }));
        // Scroll xuống cuối sau khi load: thử nhiều lần và lắng nghe ảnh load để tránh dừng giữa chừng
        requestAnimationFrame(() => {
          const container = messagesContainerRef.current;
          if (!container) return;
          // Lần đầu
          scrollToBottom();
          // Thử lại sau một nhịp và một khoảng nhỏ để đảm bảo ảnh đã tính toán xong layout
          setTimeout(scrollToBottom, 150);
          setTimeout(scrollToBottom, 400);

          const images = Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
          let pending = 0;
          const done = () => {
            pending--;
            if (pending <= 0) {
              scrollToBottom();
            }
          };
          images.forEach(img => {
            if (!img.complete) {
              pending++;
              img.addEventListener('load', done, { once: true });
              img.addEventListener('error', done, { once: true });
            }
          });
          if (pending === 0) {
            scrollToBottom();
          }
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingByConversation(prev => ({ ...prev, [conversationId]: false }));
    }
  };

  const handleConversationClick = async (conv: any, index: number) => {
    setSelectedChat(index);
    await loadMessagesForConversation(conv.id);
    
    // Đánh dấu đã đọc nếu có tin nhắn chưa đọc
    if (conv.unread > 0) {
      try {
        if (actor === 'user') {
          await markAsReadByUser(conv.id);
        } else {
          await markAsReadByProvider(conv.id);
        }
        // Cập nhật unread về 0 trong state
        setConversations(prev => 
          prev.map(c => 
            c.id === conv.id ? { ...c, unread: 0 } : c
          )
        );
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    }
  };

  const onMessagesScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    if (selectedChat === null) return;
    const convId = conversations[selectedChat]?.id;
    if (!convId) return;
    const el = e.currentTarget;
    if (el.scrollTop <= 0) {
      // Top reached → load older messages
      if (hasMoreByConversation[convId] && !loadingMoreByConversation[convId]) {
        await loadMoreOlderMessages(convId);
      }
    }
  };

  return (
    <div className="h-[calc(60vh-1px)] min-h-[595px] flex max-w-7xl mx-auto mb-1 bg-gradient-to-br border border-orange-200 rounded">
      {/* Sidebar - Danh sách chat */}
      <div className="w-96 bg-white border-r border-orange-200 flex flex-col -lg">
        {/* Header */}
        <div className="p-6 border-b border-orange-200 bg-white">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Tin Nhắn Của Tôi</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm kiếm nhà cung cấp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-orange-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            />
          </div>
        </div>

        {/* Danh sách cuộc trò chuyện */}
        <div className="flex-1 overflow-y-auto">
          {isConversationsLoading && (
            <div className="p-6 flex justify-center">
              <div className="h-6 w-6 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
            </div>
          )}
          {!isConversationsLoading && filteredConversations.length === 0 && (
            <div className="p-6 text-center text-slate-500">Không có cuộc trò chuyện nào</div>
          )}
          {filteredConversations.map((conv, index) => (
            <div
              key={conv.id}
              onClick={() => handleConversationClick(conv, index)}
              className={`p-4 border-b border-orange-100 cursor-pointer transition-all hover:bg-orange-50 ${
                selectedChat === index ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl ">
                    {conv.avatar}
                  </div>
                  {conv.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-semibold text-slate-800 truncate">{conv.name}</h3>
                    </div>
                    <span className="text-xs text-slate-500 ml-2">{conv.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-slate-600 truncate">{conv.lastMessage}</p>
                    {conv.unread > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full font-semibold">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Khu vực chat chính */}
      <div className="flex-1 flex flex-col">
        {/* Header chat */}
        <div className="bg-white border-b border-orange-200 p-4 ">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-2xl ">
                  {selectedChat !== null ? conversations[selectedChat].avatar : '💬'}
                </div>
                {selectedChat !== null && conversations[selectedChat].status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                  {selectedChat !== null ? conversations[selectedChat].name : 'Chưa chọn cuộc trò chuyện'}
                  <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Store className="w-3 h-3" />
                    Nhà cung cấp
                  </span>
                </h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`${selectedChat !== null && conversations[selectedChat].status === 'online' ? 'text-green-600' : 'text-slate-500'}`}>
                    {selectedChat !== null ? (conversations[selectedChat].status === 'online' ? 'Đang hoạt động' : 'Offline') : '—'}
                  </span>
                  <span className="text-slate-400">•</span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Khung tin nhắn */}
        <div ref={messagesContainerRef} onScroll={onMessagesScroll} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
          {selectedChat === null && (
            <div className="h-full w-full flex items-center justify-center text-slate-500">Hãy chọn một cuộc trò chuyện để xem tin nhắn</div>
          )}
          {selectedChat !== null && loadingMoreByConversation[conversations[selectedChat]?.id] && (
            <div className="w-full flex justify-center items-center py-2">
              <div className="h-5 w-5 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
            </div>
          )}
          {selectedChat !== null && (
            (() => {
              const convId = conversations[selectedChat]?.id;
              const isLoading = !!loadingByConversation[convId];
              const list = messagesByConversation[convId] || conversations[selectedChat].messages;
              if (isLoading) {
                return (
                  <div className="h-full w-full flex items-center justify-center">
                    <div className="h-8 w-8 border-2 border-slate-300 border-t-orange-500 rounded-full animate-spin" />
                  </div>
                );
              }
              if ((list || []).length === 0) {
                return (
                  <div className="h-full w-full flex items-center justify-center text-slate-500">Conversation rỗng</div>
                );
              }
              return null;
            })()
          )}
          {selectedChat !== null && (messagesByConversation[conversations[selectedChat]?.id] || conversations[selectedChat].messages).map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === actor ? 'justify-end' : 'justify-start'} transition-transform duration-200 ease-out`}
            >
              <div className={`flex items-end space-x-2 max-w-md ${msg.sender === actor ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {msg.sender !== actor && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-lg flex-shrink-0">
                    {selectedChat !== null ? conversations[selectedChat].avatar : ''}
                  </div>
                )}
                <div>
                  {(msg.image_url || msg.text) && (
                    <div
                      className={`rounded-2xl overflow-hidden ${
                        msg.sender === actor
                          ? 'border border-orange-300'
                          : 'border border-slate-300'
                      }`}
                      style={{ maxWidth: 260 }}
                    >
                      {msg.image_url && (
                        <img
                          src={msg.image_url}
                          alt="message attachment"
                          className="max-w-[260px] max-h-[240px] w-full object-cover block"
                          loading="lazy"
                        />
                      )}
                      {msg.text && (
                        <div
                          className={`${
                            msg.sender === actor
                              ? 'bg-white text-slate-800'
                              : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800'
                          } ${msg.image_url ? (msg.sender === actor ? 'border-t border-orange-200' : 'border-t border-slate-200') : ''} px-4 py-2.5`}
                        >
                          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.text}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className={`flex items-center space-x-2 mt-1 ${msg.sender === actor ? 'justify-end' : ''}`}>
                    {msg.time && <span className="text-xs text-slate-500">{msg.time}</span>}
                    {msg.sender === actor && (
                      <div className="flex items-center space-x-1">
                        {msg.status === 'sending' && (
                          <span className="text-xs text-slate-400 italic">Đang gửi...</span>
                        )}
                        {msg.status === 'failed' && (
                          <span className="text-xs text-red-500">Gửi thất bại</span>
                        )}
                        {msg.status === 'sent' && (
                          <Check className="w-3 h-3 text-slate-400" />
                        )}
                        {msg.status === 'read' && (
                          <CheckCheck className="w-3 h-3 text-blue-500" />
                        )}
                  </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Khung nhập tin nhắn */}
        <div className="bg-white border-t border-orange-200 p-4 -lg">
          <div className="flex items-center space-x-3">
            <button className="p-2.5 hover:bg-orange-100 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2.5 hover:bg-orange-100 rounded-lg transition-colors">
              <Smile className="w-5 h-5 text-slate-600" />
            </button>
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!isSending) handleSendMessage();
                }
              }}
              placeholder="Nhập tin nhắn..."
              className="flex-1 px-4 py-3 bg-slate-100 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all"
            />
            <button
              onClick={() => { if (!isSending) handleSendMessage(); }}
              disabled={isSending}
              className="p-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all  hover:-lg transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}