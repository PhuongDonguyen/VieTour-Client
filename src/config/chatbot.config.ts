export const chatbotConfig = {
  // Rasa server configuration
  rasa: {
    baseUrl: import.meta.env.DEV ? "/api/rasa" : "http://localhost:5005",
    webhookEndpoint: "/webhooks/rest/webhook",
    healthEndpoint: "/health",
    timeout: 10000, // 10 seconds
  },

  // Chat widget configuration
  widget: {
    welcomeMessage:
      "Xin chào! Tôi là trợ lý ảo của VieTour. Tôi có thể giúp gì cho bạn?",
    placeholder: "Nhập tin nhắn...",
    maxWidth: "24rem", // 384px
    maxHeight: "31.25rem", // 500px
  },

  // Error messages
  messages: {
    serverError:
      "Xin lỗi, máy chủ chatbot hiện không khả dụng. Vui lòng thử lại sau.",
    noResponse: "Xin lỗi, tôi không hiểu. Bạn có thể nói rõ hơn không?",
    networkError: "Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.",
  },
};
