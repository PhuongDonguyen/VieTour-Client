import axios from "axios";
import { chatbotConfig } from "../config/chatbot.config";

const RASA_BASE_URL = chatbotConfig.rasa.baseUrl;

export interface ChatMessage {
  sender: string;
  message: string;
}

export interface ChatResponse {
  recipient_id: string;
  text: string;
}

export const chatbotApi = {
  sendMessage: async (
    message: string,
    sender: string = "user"
  ): Promise<ChatResponse[]> => {
    try {
      const response = await axios.post(
        `${RASA_BASE_URL}${chatbotConfig.rasa.webhookEndpoint}`,
        {
          sender,
          message,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          timeout: chatbotConfig.rasa.timeout,
          withCredentials: false, // Disable credentials for CORS
        }
      );

      console.log("Rasa response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error sending message to Rasa:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response status:", error.response?.status);
        console.error("Response data:", error.response?.data);
      }
      throw error;
    }
  },

  // Health check to verify Rasa server is running
  checkHealth: async (): Promise<boolean> => {
    try {
      await axios.get(`${RASA_BASE_URL}${chatbotConfig.rasa.healthEndpoint}`, {
        timeout: 5000,
      });
      return true;
    } catch (error) {
      console.error("Rasa server health check failed:", error);
      return false;
    }
  },
};
