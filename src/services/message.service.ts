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
    const { conversation_id, page = 1, limit = 5 } = request;
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

export const createMessage = async (
  payload: SendMessagePayload
): Promise<SendMessageResponse> => {
  try {
    const response = await sendMessage(payload);

    if (response.success) {
      return response;
    }

    throw new Error('Failed to send message');
  } catch (error: any) {
    console.error('Error in createMessage:', error);
    throw new Error(error?.response?.data?.message || 'Failed to send message');
  }
};


