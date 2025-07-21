import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle, User, Send } from "lucide-react";
import { fetchTourBySlug } from "../services/tour.service";
import { fetchQuestionByTuorId } from "../services/question.service";
import dayjs from "dayjs";

interface Comment {
  id: number;
  username: string;
  content: string;
  createdAt: Date;
}

export const CommentSection = () => {
  const { slug } = useParams<{ slug: string }>();
  const [comments, setComments] = useState<Comment[]>([]);
  const [username, setUsername] = useState("");
  const [commentText, setCommentText] = useState("");
  const [tour, setTour] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const loadTour = async () => {
      try {
        if (!slug) {
          return;
        }
        const res = await fetchTourBySlug(slug);
        setTour(res);
      } catch (error) {
        console.log("Không thể tải dữ liệu tour");
      }
    };
    loadTour();
  }, []);
  useEffect(() => {
    const loadQuestion = async () => {
      try {
        const tourId = tour[0]?.id;
        console.log("ID của tour:", tourId);

        console.log("Tour: ", tour);
        setLoading(true);

        const res = await fetchQuestionByTuorId(Number(tourId));
        const data = res.data;

        setComments(
          data.map((item: any) => ({
            id: item.id,
            username: item.username,
            content: item.content,
            createdAt: new Date(item.created_at),
          }))
        );
      } catch (error) {}
    };
    loadQuestion();
  }, [tour]);

  const handleSubmit = () => {
    if (!username.trim() || !commentText.trim()) return;

    const newComment: Comment = {
      id: Date.now(),
      username,
      content: commentText,
      createdAt: new Date(),
    };

    setComments([newComment, ...comments]);
    setUsername("");
    setCommentText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 mt-10">
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-7 h-7 text-orange-500" />
        <h2 className="text-3xl font-bold text-gray-800">Bình luận</h2>
        <span className="ml-auto bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
          {comments.length} bình luận
        </span>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tên của bạn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div>

          <div className="relative">
            <textarea
              placeholder="Viết bình luận của bạn... (Ctrl + Enter để gửi)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={4}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 resize-none transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!username.trim() || !commentText.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Send className="w-4 h-4" />
              Gửi bình luận
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chưa có bình luận nào</p>
            <p className="text-gray-400 text-sm">
              Hãy là người đầu tiên bình luận!
            </p>
          </div>
        ) : (
          comments.map((c, index) => (
            <div
              key={c.id}
              className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1"
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {/* {c.username.charAt(0).toUpperCase()} */}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-gray-800">{c.username}</h4>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="text-xs text-gray-500">
                      {c.createdAt
                        .toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour12: false,
                        })
                        .replace(",", " -")}
                    </span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{c.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// export default CommentSection;
