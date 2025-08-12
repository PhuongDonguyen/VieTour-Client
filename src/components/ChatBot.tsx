import React, { useState, useRef, useEffect } from "react";
import { FaComments, FaTimes, FaPaperPlane, FaRobot } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { chatbotApi } from "../apis/chatbot.api";
import { chatbotConfig } from "../config/chatbot.config";
import ChatTourCard from "./ChatTourCard";
import ChatTextWithLinks from "./ChatTextWithLinks";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  type?: "text" | "tour_results" | "text_with_links";
  tourResults?: TourResult[];
}

interface TourResult {
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
      text: chatbotConfig.widget.welcomeMessage,
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

  // Check server health when component mounts
  useEffect(() => {
    const checkServerHealth = async () => {
      try {
        const isOnline = await chatbotApi.checkHealth();
        setIsServerOnline(isOnline);
      } catch (error) {
        setIsServerOnline(false);
      }
    };

    checkServerHealth();
  }, []);

  // Parse tour results from Rasa response
  const parseTourResults = (text: string): TourResult[] | null => {
    // Check if the response contains tour information
    if (!text.includes("Link:")) {
      return null;
    }

    const tours: TourResult[] = [];
    const lines = text.split("\n").filter((line) => line.trim());

    let currentTour: Partial<TourResult> = {};

    for (const line of lines) {
      // Check if line contains tour info with price (format 1: tour nổi bật)
      if (line.includes("|") && line.includes("VND") && line.startsWith("-")) {
        // Extract tour info from line like: "- Tour Tây Bắc 3 ngày 2 đêm | 3 ngày 2 đêm | 900.000VND"
        const parts = line.split("|").map((part) => part.trim());
        if (parts.length >= 3) {
          currentTour.title = parts[0].replace(/^-/, "").trim();
          currentTour.duration = parts[1];
          currentTour.price = parts[2];
        }
      }
      // Check if line contains tour info with price (format 2: tour cụ thể)
      else if (line.includes("|") && !line.startsWith("-")) {
        // Extract tour info from line like: "TOUR ĐÀ NẴNG - BÀ NÀ - HỘI AN - BÁN ĐẢO SƠN TRÀ | 3 ngày 2 đêm | 3000000"
        const parts = line.split("|").map((part) => part.trim());
        if (parts.length >= 3) {
          // Check if the last part looks like a price (contains numbers)
          const lastPart = parts[2];
          if (/\d/.test(lastPart)) {
            currentTour.title = parts[0].trim();
            currentTour.duration = parts[1];
            currentTour.price = lastPart;
          }
        }
      } else if (line.includes("Link:")) {
        currentTour.link = line.replace("Link:", "").trim();
      } else if (line.includes("Ảnh:")) {
        const imagePart = line.replace("Ảnh:", "").trim();
        currentTour.image = imagePart || "/VieTour-Logo.png";

        // If we have all required fields, add the tour
        if (currentTour.title && currentTour.link) {
          tours.push(currentTour as TourResult);
          currentTour = {};
        }
      }
    }

    // Handle last tour if it doesn't have image
    if (currentTour.title && currentTour.link) {
      if (!currentTour.image) {
        currentTour.image = "/VieTour-Logo.png";
      }
      tours.push(currentTour as TourResult);
    }

    // Also check for tours that might not have been processed due to missing image
    // This handles cases where the response format might be different
    if (tours.length === 0 && text.includes("|")) {
      const linesWithPipe = lines.filter(
        (line) => line.includes("|") && !line.startsWith("-")
      );
      for (const line of linesWithPipe) {
        const parts = line.split("|").map((part) => part.trim());
        if (parts.length >= 3 && /\d/.test(parts[2])) {
          const tour: TourResult = {
            title: parts[0],
            duration: parts[1],
            price: parts[2],
            link: "", // Will be filled by Link: line if exists
            image: "/VieTour-Logo.png",
          };

          // Try to find corresponding link
          const linkLine = lines.find((l) => l.includes("Link:"));
          if (linkLine) {
            tour.link = linkLine.replace("Link:", "").trim();
            tours.push(tour);
          }
        }
      }
    }

    // Additional fallback: if we still have no tours but see tour-like content
    if (tours.length === 0) {
      const tourLines = lines.filter(
        (line) =>
          line.includes("|") &&
          (line.includes("ngày") || line.includes("đêm")) &&
          /\d/.test(line)
      );

      for (const line of tourLines) {
        const parts = line.split("|").map((part) => part.trim());
        if (parts.length >= 2) {
          const tour: TourResult = {
            title: parts[0],
            duration: parts[1] || "Không xác định",
            price: parts[2] || "Liên hệ",
            link: "",
            image: "/VieTour-Logo.png",
          };

          // Find any link in the response
          const linkLine = lines.find((l) => l.includes("Link:"));
          if (linkLine) {
            tour.link = linkLine.replace("Link:", "").trim();
            tours.push(tour);
          }
        }
      }
    }

    // Final fallback: look for any content that looks like a tour
    if (tours.length === 0) {
      const potentialTourLines = lines.filter(
        (line) =>
          line.includes("|") &&
          line.length > 20 && // Reasonable length for tour info
          !line.includes("Link:") &&
          !line.includes("Ảnh:")
      );

      for (const line of potentialTourLines) {
        const parts = line.split("|").map((part) => part.trim());
        if (parts.length >= 2) {
          const tour: TourResult = {
            title: parts[0],
            duration: parts[1] || "Không xác định",
            price: parts[2] || "Liên hệ",
            link: "",
            image: "/VieTour-Logo.png",
          };

          // Find any link in the response
          const linkLine = lines.find((l) => l.includes("Link:"));
          if (linkLine) {
            tour.link = linkLine.replace("Link:", "").trim();
            tours.push(tour);
          }
        }
      }
    }

    // Remove duplicates based on title
    const uniqueTours = tours.filter(
      (tour, index, self) =>
        index === self.findIndex((t) => t.title === tour.title)
    );

    console.log("Found tours:", uniqueTours);
    console.log("Original text:", text);
    console.log("Lines:", lines);
    return uniqueTours.length > 0 ? uniqueTours : null;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    console.log("Sending message:", inputMessage);
    console.log(
      "Rasa URL:",
      `${chatbotConfig.rasa.baseUrl}${chatbotConfig.rasa.webhookEndpoint}`
    );

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const data = await chatbotApi.sendMessage(inputMessage);

      if (data && data.length > 0) {
        const botResponse = data[0].text;
        console.log("Bot response:", botResponse);

        const tourResults = parseTourResults(botResponse);
        console.log("Parsed tour results:", tourResults);

        if (tourResults && tourResults.length > 0) {
          // Display tour results
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: `Tìm thấy ${tourResults.length} tour phù hợp với yêu cầu của bạn:`,
            sender: "bot",
            timestamp: new Date(),
            type: "tour_results",
            tourResults: tourResults,
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          // Check if response contains links but couldn't parse as tours
          if (botResponse.includes("Link:")) {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: botResponse,
              sender: "bot",
              timestamp: new Date(),
              type: "text_with_links",
            };
            setMessages((prev) => [...prev, botMessage]);
          } else {
            // Display regular text response
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: botResponse,
              sender: "bot",
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, botMessage]);
          }
        }
      } else {
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: chatbotConfig.messages.noResponse,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chatbotConfig.messages.serverError,
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
      <div className="fixed bottom-4 right-4 z-50">
        {/* Chat Window */}
        {isOpen && (
          <div className="chat-widget mb-4 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FaRobot className="text-xl" />
                <div>
                  <h3 className="font-semibold">VieTour Assistant</h3>
                  <p
                    className={`text-xs ${
                      isServerOnline ? "opacity-90" : "opacity-60"
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
                  className={`flex ${
                    message.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.sender === "user"
                        ? "bg-blue-500 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {renderMessage(message)}
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === "user"
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
                  placeholder={chatbotConfig.widget.placeholder}
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
          className={`w-14 h-14 ${
            isServerOnline
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 hover:bg-gray-500"
          } text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center relative`}
        >
          {isOpen ? <FaTimes /> : <FaComments />}
          {/* Server status indicator */}
          <div
            className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
              isServerOnline ? "bg-green-400" : "bg-red-400"
            }`}
          ></div>
        </button>
      </div>
    </>
  );
};

export default ChatBot;
