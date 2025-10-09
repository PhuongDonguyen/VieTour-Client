import React from 'react';
import { Check, CheckCheck, User } from 'lucide-react';

interface ChatMessageProps {
    message: {
        id: number | string;
        text: string;
        sender: 'user' | 'provider';
        time: string;
        status: 'sending' | 'sent' | 'read' | 'failed';
        image_url: string;
    };
    isSentByMe: boolean;
    peerAvatar: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    isSentByMe,
    peerAvatar,
}) => {
    return (
        <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`flex items-end space-x-2 max-w-md ${isSentByMe ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
            >
                {!isSentByMe && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {peerAvatar ? (
                            <img
                                src={peerAvatar}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <User className="w-5 h-5 text-orange-600" />
                        )}
                    </div>
                )}
                <div>
                    {(message.image_url || message.text) && (
                        <div
                            className={`rounded-2xl overflow-hidden ${isSentByMe
                                ? 'border border-orange-300'
                                : 'border border-slate-300'
                                }`}
                            style={{ maxWidth: 260 }}
                        >
                            {message.image_url && (
                                <img
                                    src={message.image_url}
                                    alt="attachment"
                                    className="max-w-[260px] max-h-[240px] w-full object-cover block"
                                    loading="lazy"
                                />
                            )}
                            {message.text && (
                                <div
                                    className={`${isSentByMe
                                        ? 'bg-white text-slate-800'
                                        : 'bg-gradient-to-br from-slate-100 to-slate-200 text-slate-800'
                                        } ${message.image_url
                                            ? isSentByMe
                                                ? 'border-t border-orange-200'
                                                : 'border-t border-slate-200'
                                            : ''
                                        } px-4 py-2.5`}
                                >
                                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                        {message.text}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <div
                        className={`flex items-center space-x-2 mt-1 ${isSentByMe ? 'justify-end' : ''
                            }`}
                    >
                        {message.time && (
                            <span className="text-xs text-slate-500">{message.time}</span>
                        )}
                        {isSentByMe && (
                            <MessageStatus status={message.status} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface MessageStatusProps {
    status: 'sending' | 'sent' | 'read' | 'failed';
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status }) => {
    if (status === 'sending') {
        return <span className="text-xs text-slate-400 italic">Đang gửi...</span>;
    }

    if (status === 'failed') {
        return <span className="text-xs text-red-500">Gửi thất bại</span>;
    }

    if (status === 'sent') {
        return <Check className="w-3 h-3 text-slate-400" />;
    }

    if (status === 'read') {
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
    }

    return null;
};