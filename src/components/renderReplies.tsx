import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Loading } from './Loading';
import { LoadingChat } from '@/pages/admin/AdminSupport';

interface Question {
  id: number;
  user_id: number;
  tour_id: number;
  parent_question_id: number | null;
  text: string;
  created_at: string;
  user: User |null;
  questions?: Question[];
}

export const loadChat = () => {
  return (
    <div className="w-12 text-orange-600">
      <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="4" cy="12" r="3">
          <animate
            id="spinner_jObz"
            begin="0;spinner_vwSQ.end-0.25s"
            attributeName="r"
            dur="0.75s"
            values="3;.2;3"
          ></animate>
        </circle>
        <circle cx="12" cy="12" r="3">
          <animate
            begin="spinner_jObz.end-0.6s"
            attributeName="r"
            dur="0.75s"
            values="3;.2;3"
          ></animate>
        </circle>
        <circle cx="20" cy="12" r="3">
          <animate
            id="spinner_vwSQ"
            begin="spinner_jObz.end-0.45s"
            attributeName="r"
            dur="0.75s"
            values="3;.2;3"
          ></animate>
        </circle>
      </svg>
    </div>
  );
};

interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
}
type RepliesSectionProps = {
  questions: Question[];
  level?: number;
  user?: User;
  activeReplyId: number | null;
  setActiveReplyId: (id: number | null) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handleReplySubmit: (id: number) => void;
  handleDeleteQuestion: (id: number) => void;
  loading: boolean;
};

export const RepliesSection = ({ questions, level = 1, user, activeReplyId, setActiveReplyId, replyText, setReplyText, handleReplySubmit, handleDeleteQuestion , loading} : RepliesSectionProps) => {
  const [expandedReplyIds, setExpandedReplyIds] = useState<number[]>([]);

  const toggleReplyVisibility = (id: number) => {
    setExpandedReplyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className={`mt-4 pl-${2} border-l-2 border-orange-200 space-y-4`}>
      {questions.map((rep) => {
        const isExpanded = expandedReplyIds.includes(rep.id);
        return (
          <div key={rep.id} className="text-sm flex items-start gap-3">
            {/* Avatar */}
            <div className="ms-3 w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0">
              {rep.user?.avatar ? (
                <img
                  src={rep.user.avatar || "/public/avatar-default.jpg"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={"/public/avatar-default.jpg"}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Nội dung */}
            <div className="flex-1">
              <div className="font-semibold text-gray-700">
                {rep.user
                  ? `${rep.user.first_name} ${rep.user.last_name}`
                  : "Quản trị viên"}
              </div>
              <div className="text-gray-600">{rep.text}</div>
              <div className="text-xs text-gray-400">
                {new Date(rep.created_at)
                  .toLocaleString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour12: false,
                  })
                  .replace(",", " -")}
              </div>

              {/* Nút Trả lời */}
              <button
                onClick={() =>
                  setActiveReplyId(activeReplyId === rep.id ? null : rep.id)
                }
                className="mt-1 text-sm text-orange-600 hover:underline"
              >
                Trả lời
              </button>

              {/* Nút xóa */}
              {rep.user?.id === user?.id && (
                <button
                  onClick={() => handleDeleteQuestion(rep.id)}
                  className="mt-2 ms-6 text-sm text-orange-600 hover:underline"
                >
                  Xóa
                </button>
              )}

              {/* Form trả lời */}
              {activeReplyId === rep.id && (
                <div className="mt-2 space-y-2">
                  {loading ? (
                    <LoadingChat />
                  ) : (
                    <div>
                      <textarea
                        rows={2}
                        placeholder="Trả lời..."
                        value={replyText}
                        disabled={loading}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReplySubmit(rep.id);
                            if (!isExpanded) toggleReplyVisibility(rep.id);
                          }
                        }}
                        className="w-full px-4 py-2 border rounded-lg border-gray-300 resize-none"
                      />
                      <button
                          onClick={() => {
                            handleReplySubmit(rep.id);
                            if (!isExpanded) toggleReplyVisibility(rep.id);
                          }}
                        className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                      >
                        Gửi trả lời
                      </button>
                      <button
                        onClick={() => setActiveReplyId(null)}
                        className="px-4 ms-2 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition"
                      >
                        Thoát
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Nút ẩn/hiện reply con */}
              {rep.questions && rep.questions.length > 0 && (
                <button
                  onClick={() => toggleReplyVisibility(rep.id)}
                  className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp size={16} />
                      <span>Thu gọn trả lời</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown size={16} />
                      <span>Xem thêm {rep.questions.length} trả lời</span>
                    </>
                  )}
                </button>
              )}

              {/* Hiển thị reply con nếu đang mở */}
              {rep.questions && rep.questions.length > 0 && isExpanded && (
                <div className="mt-3">
                  <RepliesSection
                    questions={rep.questions}
                    level={level + 1}
                    user={user}
                    activeReplyId={activeReplyId}
                    setActiveReplyId={setActiveReplyId}
                    replyText={replyText}
                    setReplyText={setReplyText}
                    handleReplySubmit={handleReplySubmit}
                    handleDeleteQuestion={handleDeleteQuestion}
                    loading={loading}
                  />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};


