// src/pages/ChatPage.tsx
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import ChatComponent from '../components/ChatComponents';

const ChatPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const actorParam = ((): 'user' | 'provider' => {
    const qpActor = searchParams.get('actor');
    if (qpActor === 'provider') return 'provider';
    // Hỗ trợ đường dẫn dạng /admin/chat?provider
    if (searchParams.has('provider')) return 'provider';
    return 'user';
  })();

  const getPeerDisplay = actorParam === 'provider'
    ? (conv: any) => ({
        name: conv.user_profile?.full_name || `User ${conv.user_id}`,
        avatar: conv.user_profile?.avatar || '👤',
      })
    : undefined;

  return (
    <div className="h-[68vh] min-h-[700px] pt-24">
      <ChatComponent actor={actorParam} getPeerDisplay={getPeerDisplay} />
    </div>
  );
};

export default ChatPage;