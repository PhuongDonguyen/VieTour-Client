import axiosInstance from './axiosInstance';

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_text?: string;
  image_url?: string;
  created_at: string;
}

export interface MessagesResponse {
  success: boolean;
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface CreateMessageRequest {
  conversation_id: number;
  message_text?: string;
  image_url?: string;
}

export interface CreateMessageResponse {
  success: boolean;
  data: Message;
}

export interface GetMessagesRequest {
  conversation_id: number;
  page?: number;
  limit?: number;
}

export const getMessagesByConversation = async (
  request: GetMessagesRequest
): Promise<MessagesResponse> => {
  const response = await axiosInstance.get('/api/messages', {
    params: {
      conversationId: request.conversation_id,
      page: request.page ?? 1,
      limit: request.limit ?? 20,
    },
  });

  return response.data;
};

export const sendMessage = async (
  request: CreateMessageRequest
): Promise<CreateMessageResponse> => {
  const response = await axiosInstance.post('/api/messages', request);
  return response.data;
};


