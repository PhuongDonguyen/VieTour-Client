import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  MessageCircle,
  Send,
  Clock,
  Reply,
  Trash2,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { fetchTourBySlug } from "../services/tour.service";
import {
  fetchQuestionsByTourId,
  sendQuestion,
  delQuestion,
} from "../services/question.service";
import { useAuth } from "../hooks/useAuth";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import Modal from "./Modal";
import LoginForm from "./authentication/LoginForm";
import SignupForm from "./authentication/SignupForm";
import { 
  CommentSocketManager, 
  createCommentSocketManager,
  type CommentReceivedPayload 
} from "../services/commentSocket.service";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Types
interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  role?: string;
}

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

// Utility functions
const formatDate = (dateString: string): string => {
  return new Date(dateString)
    .toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    })
    .replace(",", " -");
};

const getUserDisplayName = (user: User | null): string => {
  if (!user) return "Admin";
  if (user.role === "admin") return "Admin";
  return `${user.first_name} ${user.last_name}`.trim();
};

const getUserInitials = (user: User | null): string => {
  if (!user) return "A";
  if (user.role === "admin") return "A";
  const name = getUserDisplayName(user);
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getAvatarStyling = (user: User | null) => {
  if (!user) {
    return {
      bgColor: "bg-orange-500",
      textColor: "text-white",
    };
  }
  if (user.role === "admin") {
    return {
      bgColor: "bg-orange-500",
      textColor: "text-white",
    };
  }
  return {
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
  };
};

const countTotalQuestions = (questions: Question[]): number => {
  let count = 0;
  questions.forEach((question) => {
    count++;
    if (question.questions && question.questions.length > 0) {
      count += countTotalQuestions(question.questions);
    }
  });
  return count;
};

const addReplyToTree = (
  questions: Question[],
  parentId: number,
  reply: Question
): Question[] => {
  console.log("addReplyToTree: ", parentId, reply);
  return questions.map((question) => {
    if (question.id === parentId) {
      const replyExists = question.questions?.some((r) => r.id === reply.id);
      if (replyExists) return question;

      return {
        ...question,
        questions: [...(question.questions || []), reply],
      };
    }

    if (question.questions && question.questions.length > 0) {
      return {
        ...question,
        questions: addReplyToTree(question.questions, parentId, reply),
      };
    }

    return question;
  });
};

const removeQuestionFromTree = (
  questions: Question[],
  questionIdToDelete: number
): Question[] => {
  return questions.filter((question) => {
    if (question.id === questionIdToDelete) return false;

    if (question.questions && question.questions.length > 0) {
      const updatedReplies = removeQuestionFromTree(
        question.questions,
        questionIdToDelete
      );
      if (updatedReplies.length !== question.questions.length) {
        return { ...question, questions: updatedReplies };
      }
    }

    return question;
  });
};

// Components
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center py-8">
    <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
  </div>
);

const CommentSkeleton: React.FC = () => (
  <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0">
    <div className="flex items-start gap-4">
      {/* Avatar Skeleton */}
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>

      {/* Content Skeleton */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const CommentSkeletonList: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <CommentSkeleton key={i} />
    ))}
  </div>
);

const CommentForm: React.FC<{
  onSubmit: (text: string) => void;
  submitting: boolean;
  user: User;
}> = ({ onSubmit, submitting, user }) => {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4 mb-6">
      <div>
        <textarea
          placeholder="Hãy để lại câu hỏi của bạn"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-colors"
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">{text.length}/500 ký tự</span>
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || submitting}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
    </div>
  );
};

const ReplyForm: React.FC<{
  onSubmit: (text: string) => void;
  onCancel: () => void;
  submitting: boolean;
  user: User;
  replyText: string;
  setReplyText: (text: string) => void;
}> = ({ onSubmit, onCancel, submitting, user, replyText, setReplyText }) => {
  const handleSubmit = () => {
    if (!replyText.trim()) return;
    onSubmit(replyText);
    setReplyText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <textarea
        rows={2}
        placeholder="Viết trả lời của bạn..."
        value={replyText}
        disabled={submitting}
        onChange={(e) => setReplyText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="text-sm text-gray-600 hover:text-gray-700 px-3 py-1 rounded transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={handleSubmit}
          disabled={!replyText.trim() || submitting}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white text-sm px-4 py-1 rounded transition-colors"
        >
          {submitting ? "Đang gửi..." : "Gửi"}
        </button>
      </div>
    </div>
  );
};

const CommentItem: React.FC<{
  comment: Question;
  onReply: (commentId: number) => void;
  onDelete: (comment: Question) => void;
  currentUser: User | null;
  activeReplyId: number | null;
  replyText: string;
  setReplyText: (text: string) => void;
  handleReplySubmit: (parentId: number) => void;
  deletedQuestionIds: Set<number>;
  submittingReply: boolean;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  collapsedReplyIds: Set<number>;
  setCollapsedReplyIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}> = ({
  comment,
  onReply,
  onDelete,
  currentUser,
  activeReplyId,
  replyText,
  setReplyText,
  handleReplySubmit,
  deletedQuestionIds,
  submittingReply,
  isCollapsed,
  setIsCollapsed,
  collapsedReplyIds,
  setCollapsedReplyIds,
}) => {
  // console.log("cmt",comment)
  // console.log(currentUser)
  // if (currentUser)
  // console.log(currentUser.id == comment.user_id)
  const canDelete = currentUser && currentUser.id == comment.user?.id;
  const isDeleted = deletedQuestionIds.has(comment.id);
  const avatarStyling = getAvatarStyling(comment.user);
  const hasReplies =
    comment.questions &&
    comment.questions.filter((q) => !deletedQuestionIds.has(q.id)).length > 0;
  if (isDeleted) return null;

  return (
    <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${avatarStyling.bgColor}`}
        >
          {comment.user?.avatar ? (
            <img
              src={comment.user.avatar}
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className={`text-sm font-bold ${avatarStyling.textColor}`}>
              {getUserInitials(comment.user)}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4
              className={`font-medium ${
                comment.user?.role === "admin"
                  ? "text-red-600 font-semibold"
                  : "text-gray-900"
              }`}
            >
              {getUserDisplayName(comment.user)}
            </h4>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(comment.created_at)}
            </span>
          </div>

          <p className="text-gray-700 leading-relaxed mb-3">{comment.text}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {currentUser && currentUser.role !== "admin" && (
              <button
                onClick={() =>
                  onReply(activeReplyId === comment.id ? 0 : comment.id)
                }
                className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
              >
                <Reply className="w-3 h-3" />
                Trả lời
              </button>
            )}
            {canDelete  && (
              <button
                onClick={() => {
                  onDelete(comment);
                  console.log("commentcccc: ", comment);
                }}
                className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Xóa
              </button>
            )}
            {hasReplies && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-sm text-gray-600 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-3 h-3" />
                    Hiện{" "}
                    {
                      comment.questions?.filter(
                        (q) => !deletedQuestionIds.has(q.id)
                      ).length
                    }{" "}
                    phản hồi
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3 h-3" />
                    Ẩn phản hồi
                  </>
                )}
              </button>
            )}
          </div>

          {/* Reply Form */}
          {activeReplyId === comment.id && (
            <ReplyForm
              onSubmit={(text) => handleReplySubmit(comment.id)}
              onCancel={() => onReply(0)}
              submitting={submittingReply}
              user={currentUser!}
              replyText={replyText}
              setReplyText={setReplyText}
            />
          )}

          {/* Replies */}
          {!isCollapsed &&
            comment.questions &&
            comment.questions.length > 0 && (
              <RepliesSection
                questions={comment.questions.filter(
                  (q) => !deletedQuestionIds.has(q.id)
                )}
                user={currentUser!}
                activeReplyId={activeReplyId}
                setActiveReplyId={onReply}
                replyText={replyText}
                setReplyText={setReplyText}
                handleReplySubmit={handleReplySubmit}
                handleDeleteQuestion={onDelete}
                deletedQuestionIds={deletedQuestionIds}
                submittingReply={submittingReply}
                collapsedReplyIds={collapsedReplyIds}
                setCollapsedReplyIds={setCollapsedReplyIds}
              />
            )}
        </div>
      </div>
    </div>
  );
};

const RepliesSection: React.FC<{
  questions: Question[];
  user: User;
  activeReplyId: number | null;
  setActiveReplyId: (id: number) => void;
  replyText: string;
  setReplyText: (text: string) => void;
  handleReplySubmit: (parentId: number) => void;
  handleDeleteQuestion: (comment: Question) => void;
  deletedQuestionIds: Set<number>;
  submittingReply: boolean;
  collapsedReplyIds: Set<number>;
  setCollapsedReplyIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}> = ({
  questions,
  user,
  activeReplyId,
  setActiveReplyId,
  replyText,
  setReplyText,
  handleReplySubmit,
  handleDeleteQuestion,
  deletedQuestionIds,
  submittingReply,
  collapsedReplyIds,
  setCollapsedReplyIds,
}) => {
  const toggleReplyCollapse = (replyId: number) => {
    setCollapsedReplyIds((prev: Set<number>) => {
      const newSet = new Set(prev);
      if (newSet.has(replyId)) {
        newSet.delete(replyId);
      } else {
        newSet.add(replyId);
      }
      return newSet;
    });
  };

  return (
    <div className="mt-4 space-y-3">
      {questions.map((reply) => {
        const avatarStyling = getAvatarStyling(reply.user);
        const isAdminReply = !reply.user || reply.user.role === "admin";
        const isCollapsed = collapsedReplyIds.has(reply.id);
        const hasNestedReplies =
          reply.questions &&
          reply.questions.filter((q) => !deletedQuestionIds.has(q.id)).length >
            0;

        return (
          <div
            key={reply.id}
            className={`rounded-lg p-4 ${
              isAdminReply ? "bg-blue-50 border-blue-200" : "bg-transparent"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${avatarStyling.bgColor}`}
              >
                {reply.user?.avatar ? (
                  <img
                    src={reply.user.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span
                    className={`text-xs font-bold ${avatarStyling.textColor}`}
                  >
                    {getUserInitials(reply.user)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h5
                    className={`font-medium ${
                      reply.user?.role === "admin"
                        ? "text-red-600 font-semibold"
                        : "text-gray-900"
                    } text-sm`}
                  >
                    {getUserDisplayName(reply.user)}
                  </h5>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(reply.created_at)}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {reply.text}
                </p>

                {/* Reply Actions */}
                <div className="flex items-center gap-3">
                  {user && user.role === "user" && (
                    <button
                      onClick={() =>
                        setActiveReplyId(
                          activeReplyId === reply.id ? 0 : reply.id
                        )
                      }
                      className="text-xs text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                    >
                      <Reply className="w-3 h-3" />
                      Trả lời
                    </button>
                  )}
                  {user && user.id === reply.user_id && (
                    <button
                      onClick={() => handleDeleteQuestion(reply)}
                      className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Xóa
                    </button>
                  )}
                  {hasNestedReplies && (
                    <button
                      onClick={() => toggleReplyCollapse(reply.id)}
                      className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1 transition-colors"
                    >
                      {isCollapsed ? (
                        <>
                          <ChevronDown className="w-3 h-3" />
                          Hiện{" "}
                          {
                            reply.questions?.filter(
                              (q) => !deletedQuestionIds.has(q.id)
                            ).length
                          }{" "}
                          phản hồi
                        </>
                      ) : (
                        <>
                          <ChevronUp className="w-3 h-3" />
                          Ẩn phản hồi
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Nested Reply Form */}
                {activeReplyId === reply.id && (
                  <ReplyForm
                    onSubmit={(text) => handleReplySubmit(reply.id)}
                    onCancel={() => setActiveReplyId(0)}
                    submitting={submittingReply}
                    user={user}
                    replyText={replyText}
                    setReplyText={setReplyText}
                  />
                )}

                {/* Nested Replies */}
                {!isCollapsed &&
                  reply.questions &&
                  reply.questions.length > 0 && (
                    <div className="mt-3 ml-4 pl-4 border-l-2 border-gray-200">
                      <RepliesSection
                        questions={reply.questions.filter(
                          (q) => !deletedQuestionIds.has(q.id)
                        )}
                        user={user}
                        activeReplyId={activeReplyId}
                        setActiveReplyId={setActiveReplyId}
                        replyText={replyText}
                        setReplyText={setReplyText}
                        handleReplySubmit={handleReplySubmit}
                        handleDeleteQuestion={handleDeleteQuestion}
                        deletedQuestionIds={deletedQuestionIds}
                        submittingReply={submittingReply}
                        collapsedReplyIds={collapsedReplyIds}
                        setCollapsedReplyIds={setCollapsedReplyIds}
                      />
                    </div>
                  )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Chưa có câu hỏi nào
    </h3>
    <p className="text-gray-600">Hãy hỏi những gì bạn thích</p>
  </div>
);

const LoginPrompt: React.FC<{
  onLoginClick: () => void;
}> = ({ onLoginClick }) => (
  <div className="space-y-4 mb-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Viết bình luận của bạn
      </label>
      <div
        onClick={onLoginClick}
        className="w-full px-4 py-3 border border-gray-100 rounded-lg bg-gray-50 flex items-center justify-center min-h-[120px] cursor-pointer hover:bg-gray-100 transition-all duration-200"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-3">Bạn cần đăng nhập để bình luận</p>
          <p className="text-orange-500 font-medium text-sm">
            Nhấp vào đây để đăng nhập
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Main Component
export const CommentSection: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  // State
  const [tourId, setTourId] = useState<number>(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [countQuestion, setCountQuestion] = useState<number>(0);
  const [initialLoading, setInitialLoading] = useState<boolean>(false);
  const [submittingComment, setSubmittingComment] = useState<boolean>(false);
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<Set<number>>(
    new Set()
  );
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [collapsedCommentIds, setCollapsedCommentIds] = useState<Set<number>>(
    new Set()
  );
  const [collapsedReplyIds, setCollapsedReplyIds] = useState<Set<number>>(
    new Set()
  );
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    commentId: number | null;
    commentText: string;
    userName: string;
  }>({
    isOpen: false,
    commentId: null,
    commentText: "",
    userName: "",
  });

  // Refs
  const commentSocketManagerRef = useRef<CommentSocketManager>(createCommentSocketManager());
  
  // Connect socket on mount
  useEffect(() => {
    commentSocketManagerRef.current.connect();
    return () => {
      commentSocketManagerRef.current.disconnect();
    };
  }, []);

  // Load tour by slug
  useEffect(() => {
    const loadTour = async () => {
      try {
        if (!slug) return;
        const res = await fetchTourBySlug(slug);
        setTourId(res.id);
      } catch (error) {
        console.error("Error loading tour:", error);
        toast.error("Không thể tải thông tin tour");
      }
    };
    loadTour();
  }, [slug]);

  // Setup socket listeners and join tour room
  useEffect(() => {
    if (!tourId) return;

    const manager = commentSocketManagerRef.current;
    
    // Setup event handlers
    const handleReceiveComment = (data: CommentReceivedPayload) => {
      const questionData: Question = {
        id: data.id,
        user_id: typeof data.user.id === "number" ? data.user.id : parseInt(String(data.user.id)),
        tour_id: data.tour_id,
        parent_question_id: data.parent_question_id || null,
        text: data.text,
        created_at: data.created_at,
        user: data.user as User | null,
        questions: [],
      };
      console.log("Question data: ", data);
      if (questionData.parent_question_id === null) {
        setQuestions((prev) => {
          const updatedQuestions = [questionData, ...prev];
          setCountQuestion(countTotalQuestions(updatedQuestions));
          return updatedQuestions;
        });
      } else {
        setQuestions((prev) => {
          const updatedQuestions = addReplyToTree(prev, questionData.parent_question_id ?? 0, questionData);
          setCountQuestion(countTotalQuestions(updatedQuestions));
          return updatedQuestions;
        });
      }
    };

    const handleReceiveDelete = (id: number) => {
      setDeletedQuestionIds((prev) => new Set([...prev, id]));
      setQuestions((prevQuestions) => {
        const updatedQuestions = removeQuestionFromTree(prevQuestions, id);
        setCountQuestion(countTotalQuestions(updatedQuestions));
        return updatedQuestions;
      });
    };

    // Register listeners
    manager.onReceiveComment(handleReceiveComment);
    manager.onReceiveDelete(handleReceiveDelete);

    // Join tour room
    let connectHandler: (() => void) | null = null;
    if (manager.isConnected()) {
      manager.joinTour(tourId);
      console.log("join room: ", tourId);
    } else {
      // Wait for connection then join
      const socket = manager.getSocket();
      connectHandler = () => {
        manager.joinTour(tourId);
        console.log("join room: ", tourId);
      };
      socket.on("connect", connectHandler);
    }

    // Cleanup
    return () => {
      manager.offReceiveComment(handleReceiveComment);
      manager.offReceiveDelete(handleReceiveDelete);
      if (connectHandler) {
        const socket = manager.getSocket();
        socket.off("connect", connectHandler);
      }
    };
  }, [tourId]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!tourId) return;

      try {
        setInitialLoading(true);
        const res = await fetchQuestionsByTourId(tourId);
        const transformedData = res.data.map((q: any) => ({
          ...q,
          questions: q.questions || [],
        }));

        setQuestions(transformedData);
        setCountQuestion(res.data.length);
      } catch (error) {
        console.error("Error loading questions:", error);
        toast.error("Không thể tải bình luận");
      } finally {
        setInitialLoading(false);
      }
    };

    loadQuestions();
  }, [tourId]);

  // Handlers
  const handleSubmitComment = async (text: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập!");
      return;
    }

    try {
      setSubmittingComment(true);
      const res = await sendQuestion(user.id, tourId, null, text, false);

      commentSocketManagerRef.current.emitSendComment({
        id: res.data.id,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar,
        },
        tour_id: tourId,
        parent_question_id: null,
        text: text,
        reported: false,
      });

      toast.success("Bình luận đã được gửi!");
    } catch (error) {
      console.error("Error sending comment:", error);
      toast.error("Không thể gửi bình luận");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReplySubmit = async (parentId: number) => {
    if (!user || !replyText.trim()) {
      toast.error("Vui lòng nhập nội dung trả lời!");
      return;
    }

    try {
      setSubmittingReply(true);
      const res = await sendQuestion(
        user.id,
        tourId,
        parentId,
        replyText,
        false
      );

      // Reply socket emit removed - not using commentSocket for replies
      // socketRef.current?.emit("sendReply", {...});
      console.log("reply: ", res.data);
      commentSocketManagerRef.current.emitSendComment({
        id: res.data.id,
        user: user,
        tour_id: tourId,
        parent_question_id: parentId,
        text: replyText,
        reported: false,
      });
      setReplyText("");
      setActiveReplyId(null);
      toast.success("Trả lời đã được gửi!");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("Không thể gửi trả lời");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleDeleteComment = async (comment: Question) => {
    // const comment = questions.find(q => q.id === commentId);
    console.log(comment);
    // if (!comment) return;
    console.log("delete: ", comment.id);
    setDeleteModal({
      isOpen: true,
      commentId: comment.id,
      commentText: comment.text,
      userName: getUserDisplayName(comment.user),
    });
    // socketRef.current?.emit("sendDelete", {
    //   id: comment.id,
    //   tour_id: tourId,
    // });

    // Open delete modal
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      commentId: null,
      commentText: "",
      userName: "",
    });
  };

  const confirmDeleteComment = async () => {
    const commentId = deleteModal.commentId;
    if (!commentId) return;

    try {
      // setDeletedQuestionIds((prev) => new Set([...prev, commentId]));
      await delQuestion(commentId);

      commentSocketManagerRef.current.emitSendDelete({
        id: commentId,
        tour_id: tourId,
      });

      toast.success("Bình luận đã được xóa!");
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Không thể xóa bình luận");
      setDeletedQuestionIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const handleSetActiveReplyId = (id: number) => {
    setActiveReplyId(id === 0 ? null : id);
  };

  const toggleCollapse = (commentId: number) => {
    setCollapsedCommentIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return (
    <div className="w-full mb-5 max-w-7xl mx-auto p-8 bg-white rounded-3xl border border-gray-100 mt-10 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Hỏi đáp ({countQuestion})
        </h2>
      </div>

      {/* Comment Form */}
      {user && user.role == "user" ? (
        <CommentForm
          onSubmit={handleSubmitComment}
          submitting={submittingComment}
          user={user}
        />
      ) : (
        <LoginPrompt
          onLoginClick={() => {
            console.log("Login button clicked");
            setShowLoginModal(true);
          }}
        />
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {initialLoading ? (
          <CommentSkeletonList />
        ) : questions.length === 0 ? (
          <EmptyState />
        ) : (
          questions
            .filter((q) => !deletedQuestionIds.has(q.id))
            .map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={handleSetActiveReplyId}
                onDelete={handleDeleteComment}
                currentUser={user}
                activeReplyId={activeReplyId}
                replyText={replyText}
                setReplyText={setReplyText}
                handleReplySubmit={handleReplySubmit}
                deletedQuestionIds={deletedQuestionIds}
                submittingReply={submittingReply}
                isCollapsed={collapsedCommentIds.has(comment.id)}
                setIsCollapsed={(collapsed: boolean) => {
                  if (collapsed) {
                    setCollapsedCommentIds(
                      (prev) => new Set([...prev, comment.id])
                    );
                  } else {
                    setCollapsedCommentIds((prev) => {
                      const newSet = new Set(prev);
                      newSet.delete(comment.id);
                      return newSet;
                    });
                  }
                }}
                collapsedReplyIds={collapsedReplyIds}
                setCollapsedReplyIds={setCollapsedReplyIds}
              />
            ))
        )}
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)}>
          {!showSignupForm ? (
            <LoginForm
              onClose={() => setShowLoginModal(false)}
              onSwitchForm={() => setShowSignupForm(true)}
            />
          ) : (
            <SignupForm
              onClose={() => setShowLoginModal(false)}
              onSwitchForm={() => setShowSignupForm(false)}
            />
          )}
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <Modal isOpen={deleteModal.isOpen} onClose={closeDeleteModal}>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xóa bình luận
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc muốn xóa bình luận này?
            </p>
            <div className="flex gap-3">
              <button
                onClick={closeDeleteModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={confirmDeleteComment}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
