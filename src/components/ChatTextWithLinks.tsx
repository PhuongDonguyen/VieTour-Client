import React from "react";

interface ChatTextWithLinksProps {
  text: string;
  onTourClick?: (link: string) => void;
}

const ChatTextWithLinks: React.FC<ChatTextWithLinksProps> = ({
  text,
  onTourClick,
}) => {
  // Function to extract and format links in the text
  const formatTextWithLinks = (text: string) => {
    // Split text by lines
    const lines = text.split("\n");

    return lines.map((line, lineIndex) => {
      // Check if line contains a link
      if (line.includes("Link:")) {
        const parts = line.split("Link:");
        const beforeLink = parts[0];
        const link = parts[1]?.trim();

        return (
          <div key={lineIndex} className="mb-2">
            <span className="text-sm">{beforeLink}</span>
            {link && (
              <button
                onClick={() => onTourClick?.(link)}
                className="text-blue-600 hover:text-blue-800 underline text-sm ml-1"
              >
                Xem chi tiết
              </button>
            )}
          </div>
        );
      }

      return (
        <div key={lineIndex} className="text-sm mb-1">
          {line}
        </div>
      );
    });
  };

  return <div className="space-y-1">{formatTextWithLinks(text)}</div>;
};

export default ChatTextWithLinks;
