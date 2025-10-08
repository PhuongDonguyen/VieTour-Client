import {
  getMessages,
  sendMessage,
  type MessagesResponse,
  type SendMessagePayload,
  type SendMessageResponse,
} from '../apis/message.api';

export interface FetchMessagesRequest {
  conversation_id: number;
  page?: number;
  limit?: number;
}

export const fetchMessagesByConversation = async (
  request: FetchMessagesRequest
): Promise<MessagesResponse> => {
  try {
    const { conversation_id, page = 1, limit = 20 } = request;
    const response = await getMessages(conversation_id, page, limit);

    if (response.success) {
      return response;
    }

    throw new Error('Failed to fetch messages');
  } catch (error: any) {
    console.error('Error in fetchMessagesByConversation:', error);
    throw new Error(error?.response?.data?.message || 'Failed to fetch messages');
  }
};

export interface CreateMessageRequest {
  conversation_id: number;
  message_text?: string;
  image_url?: string;
}

export const createMessage = async (
  request: CreateMessageRequest
): Promise<SendMessageResponse> => {
  try {
    const { conversation_id, message_text, image_url } = request;

    const payload: SendMessagePayload = {};
    if (message_text) payload.message_text = message_text;
    if (image_url) payload.image_url = image_url;

    const response = await sendMessage(conversation_id, payload);

    if (response.success) {
      return response;
    }

    throw new Error('Failed to send message');
  } catch (error: any) {
    console.error('Error in createMessage:', error);
    throw new Error(error?.response?.data?.message || 'Failed to send message');
  }
};


