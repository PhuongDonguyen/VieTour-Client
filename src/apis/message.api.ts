import axiosInstance from './axiosInstance';

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_text: string;
  image_url: string | null;
  is_read: boolean;
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

export const getMessages = async (
  conversationId: number,
  page: number = 1,
  limit: number = 20
): Promise<MessagesResponse> => {
  try {
    const response = await axiosInstance.get('/api/messages', {
      params: {
        conversationId,
        page,
        limit,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export interface SendMessagePayload {
  conversation_id?: number;
  receiver_id?: number;
  message_text?: string;
  image?: File;
}

export interface SendMessageResponse {
  success: boolean;
  data: Message;
}

export const sendMessage = async (
  payload: SendMessagePayload
): Promise<SendMessageResponse> => {
  try {
    const formData = new FormData();

    if (payload.conversation_id) {
      formData.append('conversation_id', payload.conversation_id.toString());
    }
    if (payload.receiver_id) {
      formData.append('receiver_id', payload.receiver_id.toString());
    }
    if (payload.message_text) {
      formData.append('message_text', payload.message_text);
    }
    if (payload.image) {
      formData.append('image', payload.image);
    }

    console.log('Sending message with FormData');
    const response = await axiosInstance.post('/api/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};


