import axiosInstance from "./axiosInstance";

export interface ProviderProfile {
  id: number;
  company_name: string;
  avatar: string;
  account_id: number;
}

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string;
  account_id: number;
}

export interface Conversation {
  id: number;
  user_id: number;
  provider_id: number;
  last_message_at: string;
  last_message_text: string;
  unread_count_user: number;
  unread_count_provider: number;
  // For user role: includes provider info (flattened structure)
  provider?: ProviderProfile;
  // For provider role: includes user info (flattened structure)
  user?: UserProfile;
}

export interface ConversationsResponse {
  success: boolean;
  data: Conversation[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const getConversations = async (
  page: number = 1,
  limit: number = 5
): Promise<ConversationsResponse> => {
  try {
    const response = await axiosInstance.get("/api/conversations", {
      params: {
        page,
        limit,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    throw error;
  }
};

export interface MarkReadResponse {
  success: boolean;
  message?: string;
}

export const markConversationReadByUser = async (
  conversationId: number
): Promise<MarkReadResponse> => {
  try {
    const response = await axiosInstance.put(
      `/api/conversations/${conversationId}/read-user`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking conversation as read by user:", error);
    throw error;
  }
};

export const markConversationReadByProvider = async (
  conversationId: number
): Promise<MarkReadResponse> => {
  try {
    const response = await axiosInstance.put(
      `/api/conversations/${conversationId}/read-provider`
    );
    return response.data;
  } catch (error) {
    console.error("Error marking conversation as read by provider:", error);
    throw error;
  }
};

export interface CreateConversationResponse {
  success: boolean;
  data: Conversation;
}

export const createNewConversation = async (
  providerId: number
): Promise<CreateConversationResponse> => {
  try {
    const response = await axiosInstance.post("/api/conversations", {
      provider_id: providerId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
};

export interface GetConversationResponse {
  success: boolean;
  data: Conversation;
}

export const getConversationById = async (
  conversationId: number
): Promise<GetConversationResponse> => {
  try {
    const response = await axiosInstance.get(
      `/api/conversations/${conversationId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching conversation by ID:", error);
    throw error;
  }
};
