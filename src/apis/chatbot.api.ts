import axiosInstance from './axiosInstance';

// Interface for tour data in chatbot response
export interface ChatbotTour {
  tour_id: number;
  name: string;
  description: string;
  location: string;
  duration: string;
  price: number;
  similarity: number;
  poster_url: string;
  slug: string;
}

// Interface for chatbot request
export interface ChatbotRequest {
  query: string;
}

// Interface for chatbot response data
export interface ChatbotResponseData {
  success: boolean;
  query: string;
  response: string;
  tours: ChatbotTour[];
}

// Interface for the full API response
export interface ChatbotApiResponse {
  success: boolean;
  response: ChatbotResponseData;
}

// Chatbot API function
export const sendChatbotMessage = (data: ChatbotRequest) =>
  axiosInstance.post<ChatbotApiResponse>('/api/chatbot', data);