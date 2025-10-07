import {
  getMessagesByConversation,
  sendMessage,
  type GetMessagesRequest,
  type MessagesResponse,
  type CreateMessageRequest,
  type CreateMessageResponse,
} from '../apis/message.api';

export const fetchMessagesByConversation = async (
  request: GetMessagesRequest
): Promise<MessagesResponse> => {
  try {
    const response = await getMessagesByConversation(request);
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
  request: CreateMessageRequest
): Promise<CreateMessageResponse> => {
  try {
    const response = await sendMessage(request);
    if (response.success) {
      return response;
    }
    throw new Error('Failed to send message');
  } catch (error: any) {
    console.error('Error in createMessage:', error);
    throw new Error(error?.response?.data?.message || 'Failed to send message');
  }
};


