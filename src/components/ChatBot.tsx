import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaRobot } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { sendChatbotMessage, ChatbotTour } from "../apis/chatbot.api";
import ChatTourCard from "./ChatTourCard";
import ChatTextWithLinks from "./ChatTextWithLinks";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "tour_results" | "text_with_links";
  tourResults?: TourCardData[];
}

interface TourCardData {
  title: string;
  duration: string;
  price: string;
  link: string;
  image: string;
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Xin chào! Tôi là trợ lý ảo của VieTour. Tôi có thể giúp gì cho bạn?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage({ query: inputMessage });

      if (response.data.success && response.data.response) {
        const { response: botResponseText, tours } = response.data.response;

        // Display the bot's text response
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          sender: "bot",
          timestamp: new Date(),
        };

        // If there are tours, add them as a separate message
        if (tours && tours.length > 0) {
          botMessage.type = "tour_results";
          botMessage.tourResults = tours.map(tour => ({
            title: tour.name || "",
            duration: tour.duration || "",
            price: tour.price ? `${tour.price.toLocaleString('vi-VN')} VND` : "Liên hệ",
            link: tour.slug ? `/tour/${tour.slug}` : "", // Use slug for link
            image: tour.poster_url || "/VieTour-Logo.png", // Use poster_url or fallback
          }));
        }

        setMessages((prev) => [...prev, botMessage]);
        setIsServerOnline(true);
      } else {
        // Handle unsuccessful response
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsServerOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTourClick = (link: string) => {
    // Navigate to tour detail page
    try {
      window.open(link, "_blank");
    } catch (error) {
      console.error("Error opening tour link:", error);
      // Fallback: try to navigate in same window
      window.location.href = link;
    }
  };

  const renderMessage = (message: Message) => {
    if (message.type === "tour_results" && message.tourResults) {
      return (
        <div className="space-y-3">
          <p className="text-sm text-gray-700 mb-3">{message.text}</p>
          <div className="space-y-3">
            {message.tourResults.map((tour, index) => (
              <ChatTourCard key={index} tour={tour} onClick={handleTourClick} />
            ))}
          </div>
        </div>
      );
    }

    if (message.type === "text_with_links") {
      return (
        <ChatTextWithLinks text={message.text} onTourClick={handleTourClick} />
      );
    }

    return <p className="text-sm">{message.text}</p>;
  };

  return (
    <>
      <style>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0.3);
            opacity: 0;
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .chat-widget {
          animation: bounce-in 0.6s ease-out;
        }
        
        .chat-messages {
          animation: slide-up 0.3s ease-out;
        }
        
        .typing-indicator {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 2px solid #e5e7eb;
          border-radius: 50%;
          border-top-color: #3b82f6;
          animation: spin 1s ease-in-out infinite;
        }
        
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Window */}
        {isOpen && (
          <div className="absolute bottom-16 right-0 w-96 h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaRobot className="text-xl" />
                <div>
                  <h3 className="font-semibold">Trợ lý ảo CSKH</h3>
                  <p
                    className={`text-xs ${isServerOnline ? "opacity-90" : "opacity-60"
                      }`}
                  >
                    {isServerOnline ? "Trực tuyến" : "Ngoại tuyến"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${message.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                      }`}
                  >
                    {renderMessage(message)}
                    <p
                      className={`text-xs mt-1 ${message.sender === "user"
                        ? "text-blue-100"
                        : "text-gray-500"
                        }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-3 py-2">
                    <div className="typing-indicator"></div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <IoMdSend />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 ${isServerOnline
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-400 hover:bg-gray-500"
            } text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative`}
        >
          {isOpen ? <FaTimes /> : <FaComments />}
          {/* Server status indicator */}
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isServerOnline ? "bg-green-400" : "bg-red-400"
              }`}
          ></div>
        </button>
      </div>
    </>
  );
};

export default ChatBot;
