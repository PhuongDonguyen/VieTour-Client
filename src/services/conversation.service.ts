import { 
  getConversations, 
  markConversationReadByUser, 
  markConversationReadByProvider,
  type ConversationsResponse,
  type MarkReadResponse 
} from '../apis/conversation.api';

export const fetchConversations = async (page: number = 1, limit: number = 5): Promise<ConversationsResponse> => {
  try {
    const response = await getConversations(page, limit);
    if (response.success) {
      return response;
    }
    throw new Error('Failed to fetch conversations');
  } catch (error: any) {
    console.error('Error in fetchConversations:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
  }
};

export const markAsReadByUser = async (conversationId: number): Promise<MarkReadResponse> => {
  try {
    const response = await markConversationReadByUser(conversationId);
    if (response.success) {
      return response;
    }
    throw new Error('Failed to mark conversation as read by user');
  } catch (error: any) {
    console.error('Error in markAsReadByUser:', error);
    throw new Error(error.response?.data?.message || 'Failed to mark conversation as read by user');
  }
};

export const markAsReadByProvider = async (conversationId: number): Promise<MarkReadResponse> => {
  try {
    const response = await markConversationReadByProvider(conversationId);
    if (response.success) {
      return response;
    }
    throw new Error('Failed to mark conversation as read by provider');
  } catch (error: any) {
    console.error('Error in markAsReadByProvider:', error);
    throw new Error(error.response?.data?.message || 'Failed to mark conversation as read by provider');
  }
};
