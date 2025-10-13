import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaRobot } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import ChatTourCard from "./ChatTourCard";
import ChatTextWithLinks from "./ChatTextWithLinks";
import { sendChatbotMessageStreamWithAbort, ChatbotTour } from "../apis/chatbot.api";

// keep this version

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "tour_results" | "text_with_links";
  tourResults?: TourCardData[];
  isStreaming?: boolean;
}

interface TourCardData {
  title: string;
  duration: string;
  price: string;
  link: string;
  image: string;
}

interface StreamingMessage {
  botMessage: Message;
  currentResponse: string;
  tourResults?: TourCardData[]; // Add this to store tours temporarily
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
  const [streamingMessage, setStreamingMessage] = useState<StreamingMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const convertTourToCardData = (tour: ChatbotTour): TourCardData => ({
    title: tour.name || "",
    duration: tour.duration || "",
    price: tour.price ? `${tour.price.toLocaleString('vi-VN')} VND` : "Liên hệ",
    link: tour.slug ? `/tour/${tour.slug}` : "",
    image: tour.poster_url || "/VieTour-Logo.png",
  });

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const queryText = inputMessage;
    setInputMessage("");
    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      let botMessage: Message | null = null;
      let currentResponse = '';
      let tourResults: TourCardData[] = []; // Store tours temporarily

      // Use the API service for streaming
      for await (const data of sendChatbotMessageStreamWithAbort(
        { query: queryText },
        abortControllerRef.current
      )) {
        if (data.type === 'metadata') {
          // Initial response with tours - store them but don't display yet
          const toursData = data.tours || [];
          tourResults = toursData.map(convertTourToCardData);

          botMessage = {
            id: (Date.now() + 1).toString(),
            text: '',
            sender: "bot",
            timestamp: new Date(),
            isStreaming: true,
          };

          setStreamingMessage({
            botMessage,
            currentResponse: '',
            tourResults // Store tours for later display
          });

        } else if (data.type === 'response_chunk') {
          // Streaming text content
          if (botMessage) {
            currentResponse += data.content;
            setStreamingMessage(prev => prev ? {
              ...prev,
              currentResponse
            } : null);
          }

        } else if (data.type === 'completed') {
          // Streaming completed - now display tours if available
          if (botMessage) {
            const finalMessage = {
              ...botMessage,
              text: currentResponse,
              isStreaming: false,
              type: tourResults.length > 0 ? "tour_results" as const : "text" as const,
              tourResults: tourResults.length > 0 ? tourResults : undefined,
            };

            setMessages((prev) => [...prev, finalMessage]);
            setStreamingMessage(null);
          }

        } else if (data.type === 'error') {
          // Handle error
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.message || "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này.",
            sender: "bot",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, errorMessage]);
          setStreamingMessage(null);
          setIsServerOnline(false);
        }
      }

      setIsServerOnline(true);

    } catch (error: any) {
      console.error("Error sending message:", error);

      if (error.name === 'AbortError') {
        console.log('Request was aborted');
        return;
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, đã có lỗi xảy ra. Vui lòng kiểm tra kết nối mạng và thử lại.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      setStreamingMessage(null);
      setIsServerOnline(false);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
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
    try {
      window.open(link, "_blank");
    } catch (error) {
      console.error("Error opening tour link:", error);
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

  const renderStreamingMessage = (streamMsg: StreamingMessage) => {
    const { currentResponse } = streamMsg;

    // Only show text during streaming, tours will be shown after completion
    return (
      <p className="text-sm">
        {currentResponse}
      </p>
    );
  };

  // Cleanup function to abort ongoing requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

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
        
        @keyframes strong-bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-3px);
          }
        }
        
        .chat-widget {
          animation: bounce-in 0.6s ease-out;
        }
        
        .chat-messages {
          animation: slide-up 0.3s ease-out;
        }
        
        .bounce-dot {
          animation: strong-bounce 0.9s infinite ease-in-out;
        }
        
        .bounce-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .bounce-dot:nth-child(2) {
          animation-delay: -0.16s;
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

              {/* Streaming message */}
              {streamingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-xs px-3 py-2 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                    {renderStreamingMessage(streamingMessage)}
                    <p className="text-xs mt-1 text-gray-500">
                      {formatTime(streamingMessage.botMessage.timestamp)}
                    </p>
                  </div>
                </div>
              )}

              {isLoading && !streamingMessage && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 rounded-lg rounded-bl-none px-3 py-2">
                    <div className="flex space-x-1 justify-center items-center">
                      <div className="h-1 w-1 bg-gray-500 rounded-full bounce-dot"></div>
                      <div className="h-1 w-1 bg-gray-500 rounded-full bounce-dot"></div>
                      <div className="h-1 w-1 bg-gray-500 rounded-full bounce-dot"></div>
                    </div>
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
