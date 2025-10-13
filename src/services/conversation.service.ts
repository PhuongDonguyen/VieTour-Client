import {
  getConversations,
  markConversationReadByUser,
  markConversationReadByProvider,
  getConversationById,
  type ConversationsResponse,
  type MarkReadResponse,
  type GetConversationResponse,
} from "../apis/conversation.api";

export const fetchConversations = async (
  page: number = 1,
  limit: number = 5
): Promise<ConversationsResponse> => {
  try {
    const response = await getConversations(page, limit);
    if (response.success) {
      return response;
    }
    throw new Error("Failed to fetch conversations");
  } catch (error: any) {
    console.error("Error in fetchConversations:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversations"
    );
  }
};




export const fetchConversationById = async (
  conversationId: number
): Promise<GetConversationResponse> => {
  try {
    const response = await getConversationById(conversationId);
    if (response.success) {
      return response;
    }
    throw new Error("Failed to fetch conversation by ID");
  } catch (error: any) {
    console.error("Error in fetchConversationById:", error);
    throw new Error(
      error.response?.data?.message || "Failed to fetch conversation by ID"
    );
  }
};
