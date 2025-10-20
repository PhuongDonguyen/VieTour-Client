import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaRobot } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import ChatTourCard from "./ChatTourCard";
import ChatTextWithLinks from "./ChatTextWithLinks";
import { sendChatbotMessageStreamWithAbort, ChatbotTour, StreamingMessage as ApiStreamingMessage } from "../apis/chatbot.api";
import { marked } from "marked";
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

// Local streaming message interface for component state
interface LocalStreamingMessage {
  botMessage: Message;
  currentResponse: string;
  tourResults?: TourCardData[];
  currentStatus?: string;
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
  const [streamingMessage, setStreamingMessage] = useState<LocalStreamingMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Add function to build conversation history
  const buildConversationHistory = () => {
    const history: { role: 'user' | 'assistant'; content: string }[] = [];

    // Convert messages to history format, excluding the initial bot greeting
    const conversationMessages = messages.slice(1); // Skip the initial greeting

    conversationMessages.forEach((message) => {
      if (message.sender === 'user') {
        history.push({
          role: 'user',
          content: message.text
        });
      } else if (message.sender === 'bot') {
        // For bot messages, use just the text content, not tour data
        history.push({
          role: 'assistant',
          content: message.text
        });
      }
    });

    return history;
  };

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
      let tourResults: TourCardData[] = [];
      let currentStatus = '';

      // Build conversation history
      const history = buildConversationHistory();

      // Use the API service for streaming with history
      for await (const data of sendChatbotMessageStreamWithAbort(
        {
          query: queryText,
          history: history
        },
        abortControllerRef.current
      )) {
        if (data.type === 'status') {
          // Update status message
          currentStatus = data.message;

          if (!botMessage) {
            botMessage = {
              id: (Date.now() + 1).toString(),
              text: '',
              sender: "bot",
              timestamp: new Date(),
              isStreaming: true,
            };
          }

          setStreamingMessage({
            botMessage,
            currentResponse: '',
            tourResults: [],
            currentStatus
          });

        } else if (data.type === 'metadata') {
          // Initial response with tours - store them but don't display yet
          const toursData = data.tours || [];
          tourResults = toursData.map(convertTourToCardData);

          if (!botMessage) {
            botMessage = {
              id: (Date.now() + 1).toString(),
              text: '',
              sender: "bot",
              timestamp: new Date(),
              isStreaming: true,
            };
          }

          setStreamingMessage({
            botMessage,
            currentResponse: '',
            tourResults,
            currentStatus: '' // Clear status when metadata arrives
          });

        } else if (data.type === 'response_chunk') {
          // Streaming text content
          if (botMessage) {
            currentResponse += data.content;
            setStreamingMessage(prev => prev ? {
              ...prev,
              currentResponse,
              currentStatus: '' // Clear status during text streaming
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

  // Function to convert **text** to bold and * to bullet points
  const formatBotText = (text: string) => {
    // First handle **text** for bold (must be done before single *)
    // let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // // Then handle single * at the start of lines for bullet points
    // formatted = formatted.replace(/^\s*\*\s+(.+)$/gm, '• $1');

    // // Handle * that appear after line breaks
    // formatted = formatted.replace(/\n\s*\*\s+(.+)/g, '\n• $1');

    // // Convert line breaks to <br> for proper HTML rendering
    // formatted = formatted.replace(/\n/g, '<br>');

    // return formatted;
    return marked.parse(text, { breaks: true });

  };

  // Update the renderMessage function
  const renderMessage = (message: Message) => {
    if (message.type === "tour_results" && message.tourResults) {
      return (
        <div className="space-y-3">
          <div
            className="text-sm text-gray-700 mb-3 markdown-body"
            dangerouslySetInnerHTML={{ __html: formatBotText(message.text) }}
          />
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

    return (
      <div
        className="text-sm markdown-body"
        dangerouslySetInnerHTML={{ __html: formatBotText(message.text) }}
      />
    );
  };

  // Add a component for status display
  const StatusIndicator: React.FC<{ message: string }> = ({ message }) => (
    <div className="flex items-center space-x-2 text-gray-600 text-sm">
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>{message}</span>
    </div>
  );

  // Update the renderStreamingMessage function
  const renderStreamingMessage = (streamMsg: LocalStreamingMessage) => {
    const { currentResponse, currentStatus, tourResults } = streamMsg;

    return (
      <div className="space-y-3">
        {/* Show status indicator when there's a status */}
        {currentStatus && (
          <StatusIndicator message={currentStatus} />
        )}

        {/* Show response text if available */}
        {currentResponse && (
          <div
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: formatBotText(currentResponse) }}
          />
        )}

        {/* Show tour results if available and no status (during text streaming) */}
        {tourResults && tourResults.length > 0 && !currentStatus && currentResponse && (
          <div className="space-y-3">
            {tourResults.map((tour, index) => (
              <ChatTourCard key={index} tour={tour} onClick={handleTourClick} />
            ))}
          </div>
        )}
      </div>
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
