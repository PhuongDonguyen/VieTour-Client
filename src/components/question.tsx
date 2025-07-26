import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  MessageCircle,
  User,
  Send,
} from "lucide-react";
import { fetchTourBySlug } from "../services/tour.service";
import { Loading } from "./Loading";
import {
  fetchQuestionByTuorId,
  sendQuestion,
  delQuestion,
} from "../services/question.service";
import {
  fetchUserById,
  fetchUserProfile,
} from "@/services/userProfile.service";
import { RepliesSection } from "./renderReplies";

interface Question {
  id: number;
  user_id: number;
  tour_id: number;
  parent_question_id: number | null;
  text: string;
  created_at: string;
  user?: User;
  replies?: Question[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export const CommentSection = () => {
  const { slug } = useParams<{ slug: string }>();

  const [commentText, setCommentText] = useState("");
  const [tourId, setTourId] = useState<number>(0);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [countQuestion, setCountQuestion] = useState<number>(0);
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const loadTour = async () => {
      try {
        if (!slug) {
          return;
        }
        const res = await fetchTourBySlug(slug);
        console.log("res:", res[0]);
        setTourId(res[0].id);
      } catch (error) {
        console.log("Không thể tải dữ liệu tour");
      }
    };
    loadTour();
  }, []);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoadingQuestion(true);
        const res = await fetchQuestionByTuorId(tourId);
        setCountQuestion(res.data.length);
        const questionsWithUser = await addUsersToQuestions(res.data);
        const nested = nestQuestions(questionsWithUser);
        setQuestions(nested);
        setLoadingQuestion(false);
      } catch (error) {
        setLoadingQuestion(false);
        console.error("Lỗi khi tải câu hỏi:", error);
      }
    };

    loadQuestions();
  }, [tourId]);

  // Log ra khi questions thay đổi
  useEffect(() => {
    console.log("Questions: ", questions);
  }, [questions]);

  // Hàm thêm thông tin user cho mỗi câu hỏi
  const addUsersToQuestions = async (
    questions: Question[]
  ): Promise<Question[]> => {
    return Promise.all(
      questions.map(async (q) => {
        try {
          const user = await fetchUserById(q.user_id);
          console.log("User: ", user.data);
          return {
            ...q,
            user: user.data,
            replies: [],
          };
        } catch (error) {
          console.error(`Lỗi khi tải user với id ${q.user_id}:`, error);
          // Gán user mặc định khi có lỗi
          const defaultUser = {
            id: q.user_id,
            first_name: "Ẩn",
            last_name: "Danh",
            avatar: "", // hoặc icon mặc định
          };
          return {
            ...q,
            user: defaultUser,
            replies: [],
          };
        }
      })
    );
  };

  function nestQuestions(data: Question[]): Question[] {
    setLoading(true);
    const map = new Map<number, Question>();
    const roots: Question[] = [];

    data.forEach((q) => {
      map.set(q.id, { ...q, replies: [] });
    });

    data.forEach((q) => {
      if (q.parent_question_id) {
        const parent = map.get(q.parent_question_id);
        if (parent) {
          parent.replies?.push(map.get(q.id)!);
        }
      } else {
        roots.push(map.get(q.id)!);
      }
    });
    setLoading(false);
    return roots;
  }

  useEffect(() => {
    const loadUserCurrent = async () => {
      try {
        const res = await fetchUserProfile();
        console.log("user cur: ", res.data);
        const data = res.data;
        setUser({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar: data.avatar,
        });
      } catch (error) {
        console.log("Lỗi tải user current");
      }
    };
    loadUserCurrent();
  }, []);

  const addQuestion = (newQuestion: Question) => {
    setQuestions((prev) => [newQuestion, ...prev]);
  };

  const submitQuestion = async () => {
    try {
      if (!user) {
        alert("Vui lòng đăng nhập!");
        return;
      }
      const res = await sendQuestion(user.id, tourId, null, commentText, false);
      console.log("res par ", res);
      const dataRes = res.data;
      const newQuestion: Question = {
        id: dataRes.id, // hoặc tạm thời sinh id từ timestamp
        user_id: dataRes.user_id,
        tour_id: dataRes.tour_id,
        parent_question_id: null,
        text: dataRes.text,
        created_at: dataRes.created_at,
        user: user,
        replies: [],
      };
      addQuestion(newQuestion);
      setCommentText("");
      const data = await res.data.json();
      console.log("Gửi câu hỏi thành công:", data);
      return data;
    } catch (error) {
      console.error("Lỗi khi gửi câu hỏi:", error);
      return null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      submitQuestion();
    }
  };

  const handleReplySubmit = async (parrent_id: number) => {
    try {
      if (!user) {
        alert("Vui lòng đăng nhập!");
        return;
      }
      setLoading(true);
      const res = await sendQuestion(
        user.id,
        tourId,
        parrent_id,
        replyText,
        false
      );

      const dataRes = res.data;

      const newQuestion: Question = {
        id: dataRes.id, // hoặc tạm thời sinh id từ timestamp
        user_id: user.id,
        tour_id: tourId,
        parent_question_id: parrent_id,
        text: replyText,
        created_at: dataRes.created_at,
        user: user,
        replies: [],
      };
      handleAddReply(parrent_id, newQuestion);
      setReplyText("");
      console.log("Gửi câu hỏi thành công:");
      setActiveReplyId(null);
      setLoading(false);
      return res;
    } catch (error) {
      console.error("Lỗi khi gửi câu hỏi:", error);
      setLoading(false);
      return null;
    }
  };

  const handleAddReply = (parentId: number, reply: Question) => {
    const updatedQuestions = addReplyToTree(questions, parentId, reply);
    setQuestions(updatedQuestions); // ✅ Trigger rerender
  };

  const addReplyToTree = (
    questions: Question[],
    parentId: number,
    reply: Question
  ): Question[] => {
    return questions.map((question) => {
      if (question.id === parentId) {
        // Nếu tìm thấy đúng parent, thêm reply vào replies
        return {
          ...question,
          replies: [...(question.replies || []), reply],
        };
      }

      // Nếu có replies thì duyệt tiếp (đệ quy)
      if (question.replies && question.replies.length > 0) {
        return {
          ...question,
          replies: addReplyToTree(question.replies, parentId, reply),
        };
      }

      return question;
    });
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await delQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
    } catch (error) {
      console.error("Lỗi khi xóa bình luận:", error);
    }
  };

  return (
    <div className="w-full mb-5 max-w-7xl mx-auto p-8 bg-gradient-to-br from-white to-gray-50 rounded-3xl border border-gray-100 mt-10">
      {/* Tiêu đề */}
      <div className="flex items-center gap-3 mb-8">
        <MessageCircle className="w-7 h-7 text-orange-500" />
        <h2 className="text-3xl font-bold text-gray-800">Bình luận</h2>
        <span className="ml-auto bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
          {countQuestion} bình luận
        </span>
      </div>

      {/* Form nhập bình luận */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <div className="space-y-4">
          {/* <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tên của bạn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all"
            />
          </div> */}

          <div className="relative">
            <textarea
              placeholder="Viết bình luận của bạn... (Enter để gửi)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={4}
              className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-100 resize-none transition-all"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={submitQuestion}
              disabled={!user || !commentText.trim() || loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitQuestion();
                }
              }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <Send className="w-4 h-4" />
              Gửi bình luận
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách bình luận */}
      <div className="space-y-4">
        {loading ? (
          <Loading />
        ) : (
          <div>
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">Chưa có bình luận nào</p>
                <p className="text-gray-400 text-sm">
                  Hãy là người đầu tiên bình luận!
                </p>
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white mt-2 p-6 rounded-2xl  hover:shadow-sm transition-all duration-200 transform border-2 border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar chữ cái đầu tên */}
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0">
                      {q.user?.avatar ? (
                        <img
                          src={q.user.avatar}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">
                          {q.user?.first_name?.charAt(0).toUpperCase() || "?"}
                        </span>
                      )}
                    </div>

                    {/* Nội dung chính */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-gray-800">
                          {q.user?.first_name + " " + q.user?.last_name ||
                            "Ẩn danh"}
                        </h4>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-xs text-gray-500">
                          {new Date(q.created_at)
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

                      <p className="text-gray-700 leading-relaxed">{q.text}</p>

                      {/* Nút trả lời */}
                      <button
                        onClick={() =>
                          setActiveReplyId(activeReplyId === q.id ? null : q.id)
                        }
                        className="mt-2 text-sm text-orange-600 hover:underline"
                      >
                        Trả lời
                      </button>
                      {q.user?.id === user?.id && (
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="mt-2 ms-6 text-sm text-orange-600 hover:underline"
                        >
                          Xóa
                        </button>
                      )}
                      {/* Ô nhập trả lời */}
                      {activeReplyId === q.id && (
                        <div className=" mt-2 space-y-2">
                          {loading ? (
                            <Loading />
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
                                    handleReplySubmit(q.id);
                                  }
                                }}
                                className="w-full px-4 py-2 border rounded-lg border-gray-300 resize-none"
                              />
                              <button
                                onClick={() => handleReplySubmit(q.id)}
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

                      {/* Danh sách trả lời */}
                      {q.replies && q.replies.length > 0 && (
                        <RepliesSection
                          replies={q.replies}
                          user={user!}
                          activeReplyId={activeReplyId}
                          setActiveReplyId={setActiveReplyId}
                          replyText={replyText}
                          setReplyText={setReplyText}
                          handleReplySubmit={handleReplySubmit}
                          handleDeleteQuestion={handleDeleteQuestion}
                          loading={loading}
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// export default CommentSection;
