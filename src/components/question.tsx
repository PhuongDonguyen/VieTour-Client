import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { MessageCircle, User, Send } from "lucide-react";
import { fetchTourBySlug } from "../services/tour.service";
import { Loading } from "./Loading";
import {
  fetchQuestionsByTourId,
  sendQuestion,
  delQuestion,
} from "../services/question.service";
import { useAuth } from "../hooks/useAuth";
import { RepliesSection } from "./renderReplies";
import { LoadingChat } from "@/pages/admin/AdminSupport";
import CommentBox from "./commentBox";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import { da } from "date-fns/locale";

interface Question {
  id: number;
  user_id: number;
  tour_id: number;
  parent_question_id: number | null;
  text: string;
  created_at: string;
  user: User | null;
  questions?: Question[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
}

// interface Comment{
//   id: number,
//   user: User,
//   tour_id: number;
//   parent_question_id: number | null;
//   text: string;
//   created_at: string;
//   reported: boolean;
//   questions?: Qu
// }

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

export const CommentSection = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const [commentText, setCommentText] = useState("");
  const [tourId, setTourId] = useState<number>(0);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [countQuestion, setCountQuestion] = useState<number>(0);
  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:8000", { withCredentials: false });
    socketRef.current = socket;
    console.log("khởi động real time");
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      console.log("Tour id: ", tourId);
      if (tourId) {
        socket.emit("joinRoom", tourId);
      }
    });

    socket.on("receiveComment", (data: Question) => {
      console.log("data: ", data);
      const newQuestion: Question = {
        id: data.id,
        user_id: data.user_id, // hoặc tạm thời sinh id từ timestamp
        tour_id: data.tour_id,
        parent_question_id: null,
        text: data.text,
        created_at: data.created_at,
        user: data.user,
        questions: [],
      };
      console.log("new", newQuestion);
      addQuestion(newQuestion);
    });

    socket.on("receiveReply", (data: Question) => {
      console.log(questions);
      console.log("data: ", data);
      const newQuestion: Question = {
        id: data.id,
        user_id: data.user_id, // hoặc tạm thời sinh id từ timestamp
        tour_id: data.tour_id,
        parent_question_id: data.parent_question_id,
        text: data.text,
        created_at: data.created_at,
        user: data.user,
        questions: [],
      };
      console.log("new", newQuestion);
      handleAddReply(data.parent_question_id!, newQuestion);
    });

    
    
    socket.on("receiveDelete", (id: number) => {
      console.log("id delete", id);
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    })


    return () => {
      socket.disconnect();
    };
  }, [tourId]);

  useEffect(() => {
    const loadTour = async () => {
      try {
        if (!slug) {
          return;
        }
        console.log("token", localStorage.getItem("token"));

        const res = await fetchTourBySlug(slug);
        console.log("res:", res);
        setTourId(res.id);
      } catch (error) {
        console.log("Không thể tải dữ liệu tour");
      }
    };
    loadTour();
  }, []);

  useEffect(() => {
    console.log("Tour id: ", tourId);
  }, [tourId]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoadingQuestion(true);
        const res = await fetchQuestionsByTourId(tourId);
        console.log("Tour id: ", res);

        setCountQuestion(res.data.length);

        const rawData = res.data;

        const transformedData = rawData.map((q: any) => ({
          ...q,
          questions: q.questions || [],
        }));

        setQuestions(transformedData);
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

  const addQuestion = (newQuestion: Question) => {
    console.log("new Qt: ", newQuestion);
    setQuestions((prev) => [newQuestion, ...prev]);
  };

  const submitQuestion = async () => {
    try {
      if (!user) {
        alert("Vui lòng đăng nhập!");
        return;
      }
      setLoadingQuestion(true);
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
        questions: [],
      };
      
      socketRef.current?.emit("sendComment", {
        id: dataRes.id,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar
        },
        tour_id: tourId,
        parent_question_id: null,
        text: commentText,
        reported: false
      });
      // addQuestion(newQuestion);
      setCommentText("");
      const data = await res.data.json();
      console.log("Gửi câu hỏi thành công:", data);
      setLoadingQuestion(false);
      return data;
    } catch (error) {
      console.error("Lỗi khi gửi câu hỏi:", error);
      setLoadingQuestion(false);
      return null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      submitQuestion();
    }
  };

  const handleReplySubmit = async (parent_id: number) => {
    try {
      if (!user) {
        alert("Vui lòng đăng nhập!");
        return;
      }
      setLoadingQuestion(true);
      const res = await sendQuestion(
        user.id,
        tourId,
        parent_id,
        replyText,
        false
      );

      const dataRes = res.data;
      console.log("Parent id: ", parent_id);
      socketRef.current?.emit("sendReply", {
        id: dataRes.id,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar
        },
        user_id: user.id,
        tour_id: tourId,
        parent_question_id: parent_id,
        text: replyText,
        reported: false,
      });
            const newQuestion: Question = {
        id: dataRes.id, // hoặc tạm thời sinh id từ timestamp
        user_id: user.id,
        tour_id: tourId,
        parent_question_id: parent_id,
        text: replyText,
        created_at: dataRes.created_at,
        user: user,
        questions: [],
      };

      // handleAddReply(parrent_id, newQuestion);
      console.log("Question1:" , questions);
      setReplyText("");
      console.log("Gửi câu hỏi thành công:");
      setActiveReplyId(null);
      setLoadingQuestion(false);
      return res;
    } catch (error) {
      console.error("Lỗi khi gửi câu hỏi:", error);
      setLoadingQuestion(false);
      return null;
    }
  };

  const handleAddReply = (parentId: number, reply: Question ) => {
    console.log("Question:", questions);
    const updatedQuestions = addReplyToTree(questions, parentId, reply);
    console.log("Update:" , updatedQuestions);
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
          questions: [...(question.questions || []), reply],
        };
      }

      // Nếu có questions thì duyệt tiếp (đệ quy)
      if (question.questions && question.questions.length > 0) {
        return {
          ...question,
          questions: addReplyToTree(question.questions, parentId, reply),
        };
      }

      return question;
    });
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Bạn có chắc muốn xóa bình luận này?")) return;
    try {
      await delQuestion(questionId);
      socketRef.current?.emit("sendDelete", {
        id: questionId,
        tour_id: tourId
      });

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
      <CommentBox tourId={tourId} />
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
                          src={q.user.avatar || "/public/avatar-default.jpg"}
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
                          {!!q.user
                            ? q.user?.first_name + " " + q.user?.last_name
                            : "Quản trị viên"}
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
                          {loadingQuestion ? (
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
                      {q.questions && q.questions.length > 0 && (
                        <RepliesSection
                          questions={q.questions}
                          user={user!}
                          activeReplyId={activeReplyId}
                          setActiveReplyId={setActiveReplyId}
                          replyText={replyText}
                          setReplyText={setReplyText}
                          handleReplySubmit={handleReplySubmit}
                          handleDeleteQuestion={handleDeleteQuestion}
                          loading={loadingQuestion}
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
