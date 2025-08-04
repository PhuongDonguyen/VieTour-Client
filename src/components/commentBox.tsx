import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";


interface User {
  id: number;
  name?: string;
  avatar?: string;
  role?: string;
}

interface Comment {
  tour_id: number;
  text: string;
  createdAt: string;
  user: User;
}

interface Props {
  tourId: number;
  // token: string; // JWT token từ đăng nhập
}

const frontend_url = import.meta.env.VITE_FRONTEND_URL;

const CommentBox: React.FC<Props> = ({ tourId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const socketRef = useRef<Socket | null>(null);


  useEffect(() => {
    const socket = io("http://localhost:8000",{withCredentials: false});
    console.log(frontend_url);
    socketRef.current = socket;
    console.log("khởi động real time");
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      console.log("Tour id: ", tourId);
      if (tourId) {
        socket.emit("joinRoom", tourId);
      }
    });

    socket.on("receiveComment", (data: Comment) => {
      setComments((prev) => [...prev, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, [tourId]);

  const handleSend = () => {
    if (!text.trim()) return;

    socketRef.current?.emit("sendComment", {
      tour_id: tourId,
      text,
    });

    setText("");
  };

  return (
    <div className="max-w-xl mx-auto p-4 border rounded-lg shadow">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Bình luận</h2>
        <div className="mt-2 max-h-64 overflow-y-auto space-y-2">
          {comments.map((c, index) => (
            <div key={index} className="p-2 border rounded">
              <div className="text-sm text-gray-600">
                {c.user?.name || `User ${c.user?.id}`} -{" "}
                {new Date(c.createdAt).toLocaleTimeString()}
              </div>
              <div className="text-md">{c.text}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nhập bình luận..."
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Gửi
        </button>
      </div>
    </div>
  );
};

export default CommentBox;
