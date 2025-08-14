import React, { use, useEffect, useState, useContext, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  delQuestion,
  fetchQuestionsByTourId,
  sendQuestion,
} from "@/services/question.service";
import {
  User,
  MessageCircle,
  Send,
  Search,
  RefreshCw,
  Eye,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import { fetchAllToursByProviderId } from "@/services/tour.service";
import { AuthContext } from "@/context/authContext";
import { updateReported } from "@/apis/question.api";
import { set } from "date-fns";

// Interface theo cấu trúc API thực tế
interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null; // Có thể là null nếu không có avatar
}

interface Question {
  id: number;
  user_id: number | null;
  tour_id: number;
  parent_question_id: number | null;
  text: string;
  created_at: string;
  reported: boolean;
  user: User;
  questions?: Question[]; // replies
}

interface Tour {
  id: number;
  title: string;
  poster_url: string;
  description?: string;
  slug?: string;
  tour_category_id?: number;
  price?: number;
  discountedPrice?: number;
  duration?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  view_count?: number;
  total_star?: number;
  review_count?: number;
  capacity?: number;
  transportation?: string;
  accommodation?: string;
  destination_intro?: string;
  tour_info?: string;
  live_commentary?: string;
  location?: string;
  booked_count?: number;
  tour_category?: {
    id: number;
    name: string;
  };
}

// Mock tours data - 仅用于测试，实际使用 API 数据
const mockTours: Tour[] = [
  {
    id: 1,
    title: "Tour Hà Nội - Sapa 3 ngày 2 đêm",
    poster_url: "/public/VieTour-Logo.png",
  },
  {
    id: 2,
    title: "Tour Đà Nẵng - Hội An - Huế 4 ngày 3 đêm",
    poster_url: "/public/VieTour-Logo.png",
  },
  {
    id: 3,
    title: "Tour Phú Quốc 3 ngày 2 đêm",
    poster_url: "/public/VieTour-Logo.png",
  },
];

export const LoadingChat = () => {
  return (
    <div className="w-12 text-orange-600">
      <svg
        fill="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="4" cy="12" r="3" opacity="1">
          <animate
            id="spinner_qYjJ"
            begin="0;spinner_t4KZ.end-0.25s"
            attributeName="opacity"
            dur="0.75s"
            values="1;.2"
            fill="freeze"
          ></animate>
        </circle>
        <circle cx="12" cy="12" r="3" opacity=".4">
          <animate
            begin="spinner_qYjJ.begin+0.15s"
            attributeName="opacity"
            dur="0.75s"
            values="1;.2"
            fill="freeze"
          ></animate>
        </circle>
        <circle cx="20" cy="12" r="3" opacity=".3">
          <animate
            id="spinner_t4KZ"
            begin="spinner_qYjJ.begin+0.3s"
            attributeName="opacity"
            dur="0.75s"
            values="1;.2"
            fill="freeze"
          ></animate>
        </circle>
      </svg>
    </div>
  );
};

const AdminSupport: React.FC = () => {
  const { user } = useContext(AuthContext);

  // State cho tours
  const [selectedTour, setSelectedTour] = useState<number | "all">("all");
  
  // State cho pagination và infinite scroll
  const [tours, setTours] = useState<Tour[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const toursContainerRef = useRef<HTMLDivElement>(null);

  // State cho UI
  const [selected, setSelected] = useState<Question | null>(null);
  const [selectedReply, setSelectedReply] = useState<Question | null>(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );
  const expandReply = (id: number) => {
    setExpandedReplies((prev) => {
      if (prev.has(id)) return prev; // đã mở → không làm gì
      const newSet = new Set(prev);
      newSet.add(id); // thêm id vào danh sách đang mở
      return newSet;
    });
  };
  const collapseReply = (id: number) => {
    setExpandedReplies((prev) => {
      if (!prev.has(id)) return prev; // chưa mở → không làm gì
      const newSet = new Set(prev);
      newSet.delete(id); // xóa id khỏi danh sách mở
      return newSet;
    });
  };

  const [questions, setQuestions] = useState<Question[]>([]);
  const [replyLoading, setReplyLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lấy provider_id từ user context
  const providerId = user?.id || null;

  // Hàm fetch tours với pagination
  const fetchTours = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setLoadingMore(true);
      console.log("provider id: ", providerId);
      const res = await fetchAllToursByProviderId(providerId, page, 10);
      console.log("Fetched tours:", res);
      
      const newTours = res.data || [];
      
      if (append) {
        setTours(prev => [...prev, ...newTours]);
      } else {
        setTours(newTours);
      }
      
      // Kiểm tra xem còn dữ liệu không dựa trên pagination info
      if (res.pagination) {
        setHasMore(res.pagination.hasNextPage);
      } else {
        // Fallback nếu không có pagination info
        setHasMore(newTours.length === 10);
      }
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching tours:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [providerId]);

  // Hàm load more tours
  const loadMoreTours = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchTours(currentPage + 1, true);
    }
  }, [loadingMore, hasMore, currentPage, fetchTours]);

  // Scroll handler với debounce
  const handleScroll = useCallback(() => {
    if (!toursContainerRef.current || loadingMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = toursContainerRef.current;
    
    // Khi scroll đến 80% cuối cùng thì load more
    if (scrollTop + clientHeight >= scrollHeight * 0.8) {
      loadMoreTours();
    }
  }, [loadMoreTours, loadingMore]);

  useEffect(() => {
    fetchTours(1, false);
  }, [fetchTours]);

  // Thêm scroll listener
  useEffect(() => {
    const container = toursContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        if (selectedTour === "all") {
          // setQuestions(mockQuestions);
          return;
        }
        const res = await fetchQuestionsByTourId(selectedTour);
        console.log("Fetched questions:", res);
        setQuestions(res.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching questions:", error);
        setLoading(false);
      }
    };

    if (selectedTour) {
      fetchQuestions();
    }
  }, [selectedTour]);
  useEffect(() => {
    console.log("Selected tour changed:", selectedTour);
  }, [selectedTour]);

  useEffect(() => {
    console.log("questions changed:", questions);
  }, [questions]);

  useEffect(() => {}, [selectedTour]);

  // Lọc câu hỏi theo trạng thái, tìm kiếm và tour
  const filteredQuestions = questions.filter((q) => {
    const matchStatus =
      filter === "all" ||
      (filter === "answered" && q.questions && q.questions.length > 0) ||
      (filter === "unanswered" && (!q.questions || q.questions.length === 0));

    const matchSearch =
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      `${q.user.first_name} ${q.user.last_name}`
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchTour = selectedTour === "all" || q.tour_id === selectedTour;

    return matchStatus && matchSearch && matchTour;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour12: false,
    });
  };

  const handleTourChange = (tourId: number | "all") => {
    setSelectedTour(tourId);
    setSelected(null);
    setSelectedReply(null);
    setReplyText("");
    
    // Reset pagination when changing tour selection
    if (tourId === "all") {
      setCurrentPage(1);
      setHasMore(true);
      fetchTours(1, false);
    }
  };

  function addReplyImmutable(
    questions: Question[],
    parentId: number,
    newReply: Question
  ): Question[] {
    return questions.map((q) => {
      if (q.id === parentId) {
        return {
          ...q,
          questions: [...(q.questions || []), newReply],
        };
      }

      if (q.questions && q.questions.length > 0) {
        return {
          ...q,
          questions: addReplyImmutable(q.questions, parentId, newReply),
        };
      }

      return q;
    });
  }

  function deleteReplyImmutable(
    questions: Question[],
    idToDelete: number
  ): Question[] {
    return questions
      .filter((q) => q.id !== idToDelete)
      .map((q) => {
        if (q.questions && q.questions.length > 0) {
          return {
            ...q,
            questions: deleteReplyImmutable(q.questions, idToDelete),
          };
        }
        return q;
      });
  }

  const handleReplyToQuestion = async () => {
    // Logic trả lời câu hỏi gốc
    console.log("Trả lời câu hỏi gốc:", selected, replyText);
    try {
      if (!selected || !replyText.trim()) return;
      setReplyLoading(true);
      console.log("Selected question response:", selected);
      const res = await sendQuestion(
        null,
        selected.tour_id,
        selected.id,
        replyText,
        true
      );

      const updatedTree = addReplyImmutable(questions, selected.id, res.data);
      setQuestions(updatedTree);
      console.log("rerendered questions:", updatedTree);
      const resReported = await updateReported(true, selected.id);
      expandReply(selected.id);
      setReplyLoading(false);
    } catch (error) {
      console.error("Error replying to question:", error);
      setReplyLoading(false);
    }

    setReplyText("");
  };

  const handleReplyToReply = async (replyId: number) => {
    // Logic trả lời reply con
    console.log("Trả lời reply:", replyId, replyText, selectedReply);
    try {
      if (!replyId || !replyText.trim()) {
        console.log("selected", selected);
        return;
      }
      setReplyLoading(true);
      const res = await sendQuestion(
        null,
        selectedReply!.tour_id,
        replyId,
        replyText,
        true
      );

      const updatedTree = addReplyImmutable(
        questions,
        selectedReply!.id,
        res.data
      );
      setQuestions(updatedTree);
      const resReported = await updateReported(true, replyId);
      expandReply(selectedReply!.id);
      setReplyLoading(false);
    } catch (error) {
      console.error("Error replying to question:", error);
      setReplyLoading(false);
    }
    setReplyText("");
  };

  const handleSelectReply = (reply: Question) => {
    setSelectedReply(reply);
    setSelected(null);
  };

  const handleSelectQuestion = (question: Question) => {
    setSelected(question);
    setSelectedReply(null);
  };
  const handleDeleteReply = async (replyId?: number) => {
    if (!replyId) {
      console.error("No reply ID provided for deletion");
      return;
    }

    const confirmDelete = window.confirm(
      "Bạn có chắc chắn muốn xóa bình luận này?"
    );
    if (!confirmDelete) return;

    try {
      await delQuestion(replyId);
      const newState = deleteReplyImmutable(questions, replyId);
      setQuestions(newState);
    } catch (error) {
      console.error("Error deleting reply:", error);
    }
  };

  // Hàm đếm tổng số replies (bao gồm nested)
  const countTotalReplies = (questions: Question[]): number => {
    let count = 0;
    questions.forEach((q) => {
      count += 1; // Đếm reply hiện tại
      if (q.questions && q.questions.length > 0) {
        count += countTotalReplies(q.questions); // Đếm replies con
      }
    });
    return count;
  };

  const toggleReplies = (questionId: number) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedReplies(newExpanded);
  };

  const handleToggleReported = async (id: number, currentReported: boolean) => {
    try {
      await updateReported(!currentReported, id); // API cập nhật server

      // Cập nhật local state theo kiểu immutable
      setQuestions((prevQuestions) =>
        prevQuestions.map((q) =>
          q.id === id
            ? { ...q, reported: !currentReported }
            : {
                ...q,
                questions: q.questions
                  ? q.questions.map((subQ) =>
                      subQ.id === id
                        ? { ...subQ, reported: !currentReported }
                        : subQ
                    )
                  : q.questions,
              }
        )
      );
    } catch (error) {
      console.error("Lỗi khi toggle trạng thái trả lời:", error);
    }
  };

  // Component recursive để hiển thị nested replies
  const RenderNestedReplies = ({
    replies,
    level = 0,
  }: {
    replies: Question[];
    level?: number;
  }) => {
    if (!replies || replies.length === 0) return null;

    return (
      <div className="space-y-1 mt-1">
        {replies.map((reply) => (
          <div key={reply.id}>
            <div
              className={`ml-${Math.min(
                level * 4,
                12
              )} p-2 rounded text-xs cursor-pointer transition-colors ${
                selectedReply?.id === reply.id
                  ? "bg-primary/20 border border-primary"
                  : "bg-muted/50 hover:bg-muted/70"
              }`}
              onClick={() => handleSelectReply(reply)}
            >
              <div className="flex items-center gap-2 mb-1">
                {reply.user != null ? (
                  <img
                    src={reply.user!.avatar || "/public/avatar-default.jpg"}
                    alt="avatar"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
                <div className="font-medium flex-1">
                  {reply.user
                    ? `${reply.user.first_name} ${reply.user.last_name}`
                    : "Quản trị viên"}

                  {/* {reply.user_id === 23 && (
                    <span className="ml-1 text-primary">(Admin)</span>
                  )} */}
                </div>
                {/* Badge trạng thái cho reply */}
                {reply.reported ? (
                  <Badge
                    variant="secondary"
                    onClick={() => handleToggleReported(reply.id, reply.reported)}
                    className="cursor-pointer"
                  >
                    Đã trả lời
                  </Badge>
                ) : (
                  <span
                    onClick={() => handleToggleReported(reply.id, reply.reported)}
                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-xs shadow-sm border border-yellow-300"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Chưa trả lời
                  </span>
                )}

                {!reply.user_id && (
                  <button
                    onClick={() => handleDeleteReply(reply.id)}
                    className="p-2 rounded-full hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors"
                    title="Xóa phản hồi"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
              <div className="text-muted-foreground ml-6">{reply.text}</div>
              <div className="text-muted-foreground text-xs ml-6">
                {formatDate(reply.created_at)}
              </div>
            </div>

            {/* Hiển thị replies con nếu có */}
            {reply.questions && reply.questions.length > 0 && (
              <RenderNestedReplies
                replies={reply.questions}
                level={level + 1}
              />
            )}
          </div>
        ))}
        {replyLoading ? <LoadingChat /> : null}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Quản lý câu hỏi
                </h1>
                <p className="text-gray-600 mt-1 text-lg">
                  Trả lời câu hỏi từ khách hàng về các tour
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl px-4 py-3 inline-block shadow-sm">
              <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                ✓ Đã load <span className="font-bold text-emerald-800">{filteredQuestions.length}</span> câu hỏi
                {selectedTour !== "all" && <span className="text-emerald-600"> cho tour được chọn</span>}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="bg-white/80 hover:bg-white border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md transition-all duration-200"
            onClick={() => {
              setCurrentPage(1);
              setHasMore(true);
              fetchTours(1, false);
            }}
            disabled={loadingMore}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingMore ? 'animate-spin' : ''}`} />
            {loadingMore ? 'Đang tải...' : 'Làm mới'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      {/* <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-blue-500 transition-colors duration-200" />
                <Input
                  placeholder="Tìm kiếm câu hỏi, tên khách hàng hoặc tour..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white/60 hover:bg-white/80 focus:bg-white"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                id="filter-select"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all duration-200 bg-white/60 hover:bg-white/80 focus:bg-white"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">Tất cả</option>
                <option value="unanswered">Chưa trả lời</option>
                <option value="answered">Đã trả lời</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
        <Card className="w-full max-w-xs bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Danh sách tour</h2>
            </div>

            {/* Khung cuộn */}
            <div className="max-h-110 overflow-y-auto pr-1 custom-scrollbar" ref={toursContainerRef}>
              <div className="flex flex-col space-y-2">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    onClick={() => {
                      const value = tour.id;
                      setSelectedTour(value);
                      handleTourChange(value);
                    }}
                    className={`flex items-center gap-3 py-3 px-3 cursor-pointer rounded-xl transition-all duration-200 hover:shadow-md hover:scale-[1.02] ${
                      selectedTour === tour.id 
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-md" 
                        : "hover:bg-white/60 border border-transparent hover:border-gray-200"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
                      {tour.poster_url ? (
                        <img
                          src={tour.poster_url}
                          alt={tour.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/public/VieTour-Logo.png";
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                          selectedTour === tour.id
                            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg"
                            : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600"
                        }`}>
                          {tour.title[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tour.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Mã tour: {tour.id}
                      </p>
                    </div>
                    <div className={`text-xs transition-colors duration-200 ${
                      selectedTour === tour.id ? "text-blue-500" : "text-gray-400"
                    }`}>➔</div>
                  </div>
                ))}
                
                {/* Loading indicator */}
                {loadingMore && (
                  <div className="flex items-center justify-center py-4">
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Đang tải thêm tour...</span>
                    </div>
                  </div>
                )}
                
                {/* End of list indicator */}
                {!hasMore && tours.length > 0 && (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    <div className="w-full h-px bg-gray-200 mb-3"></div>
                    <span>Đã hiển thị tất cả tour</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 md:flex-row md:gap-10">
          {/* Sidebar danh sách câu hỏi */}
          <div className="w-full md:w-2/3 flex flex-col h-[300px] md:h-auto">
            {filteredQuestions.length === 0 ? (
              <Card className="flex-1">
                <CardContent className="p-8 text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    {selectedTour !== "all"
                      ? "Chưa có câu hỏi nào cho tour này"
                      : "Chưa có câu hỏi nào"}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {selectedTour !== "all"
                      ? "Khách hàng sẽ gửi câu hỏi về tour này tại đây"
                      : "Khách hàng sẽ gửi câu hỏi về tour của bạn tại đây"}
                  </p>
                  {/* {selectedTour !== "all" && (
                    <Button
                      onClick={() => handleTourChange("all")}
                      variant="outline"
                      className="mt-4"
                    >
                      Xem tất cả tour
                    </Button>
                  )} */}
                </CardContent>
              </Card>
            ) : (
              <div className="w-[400px] flex-1 overflow-y-auto space-y-1 pr-2">
                {filteredQuestions.map((q) => (
                  <div key={q.id}>
                    {/* Câu hỏi chính */}
                    <Card
                      className={`cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.005] ${
                        selected?.id === q.id 
                          ? "border-blue-300 shadow-md bg-gradient-to-r from-blue-50/50 to-indigo-50/50" 
                          : "hover:border-gray-200"
                      }`}
                      onClick={() => handleSelectQuestion(q)}
                    >
                    <CardContent className="h-[50px] flex gap-3 items-center p-3">
                        <div className="relative">
                          {q.user!.avatar ? (
                            <img
                              src={q.user!.avatar || "/public/avatar-default.jpg"}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-blue-100"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-100">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                          {/* Status indicator */}
                          <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm ${
                            q.reported ? "bg-emerald-500" : "bg-amber-500"
                          }`}></div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                              {q.user.first_name} {q.user.last_name}
                            </h4>
                            {(() => {
                              const tour = tours.find((t) => t.id === q.tour_id);
                              return tour?.poster_url ? (
                                <img
                                  src={tour.poster_url}
                                  alt={tour.title}
                                  className="w-4 h-4 rounded object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/public/VieTour-Logo.png";
                                  }}
                                />
                              ) : null;
                            })()}
                          </div>
                          
                          <p className="text-gray-800 text-base leading-relaxed line-clamp-2 font-semibold">
                            {q.text}
                          </p>
                        </div>
                        
                        {/* Badge trạng thái nhỏ gọn */}
                        <div className="flex-shrink-0">
                          {q.reported ? (
                            <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm border border-white animate-pulse"></div>
                          ) : (
                            <div className="w-3 h-3 bg-amber-500 rounded-full shadow-sm border border-white animate-pulse"></div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Replies mở rộng bên dưới câu hỏi */}
                    {q.questions && q.questions.length > 0 && (
                      <div className="ml-3 mt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReplies(q.id);
                          }}
                          className="w-full justify-start gap-1 text-xs hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 rounded-md py-1 h-7"
                        >
                          {expandedReplies.has(q.id) ? (
                            <>
                              <ChevronUp className="w-3 h-3 text-blue-500" />
                              Thu gọn ({countTotalReplies(
                                q.questions || []
                              )})
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3 text-gray-500" />
                              Mở rộng ({countTotalReplies(
                                q.questions || []
                              )})
                            </>
                          )}
                        </Button>

                        {expandedReplies.has(q.id) && (
                          <RenderNestedReplies replies={q.questions || []} />
                        )}
                        {replyLoading && selected?.id === q.id && (
                          <div className="flex items-center justify-center py-2">
                            <LoadingChat />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần chi tiết câu hỏi */}
          <div className="md:w-2/3 flex flex-col">
            {selectedReply ? (
              <Card className="flex-1 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                    <div className="relative">
                      {selectedReply.user != null ? (
                        <img
                          src={
                            selectedReply.user!.avatar ||
                            "/public/avatar-default.jpg"
                          }
                          alt="avatar"
                          className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        selectedReply.reported ? "bg-emerald-500" : "bg-amber-500"
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedReply.user
                            ? `${selectedReply.user.first_name} ${selectedReply.user.last_name}`
                            : "Quản trị viên"}
                        </h3>
                        {/* {selectedReply.user_id === 23 && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                            Admin
                          </Badge>
                        )} */}
                      </div>
                      <div className="text-sm text-gray-600 mb-1">
                        Reply #{selectedReply.id}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(selectedReply.created_at)}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-lg font-semibold te  xt-black">{selectedReply.text}</div>
                </CardContent>
              </Card>
            ) : selected ? (
              <Card className="flex-1 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                    <div className="relative">
                      {selected.user != null ? (
                        <img
                          src={
                            selected.user!.avatar || "/public/avatar-default.jpg"
                          }
                          alt="avatar"
                          className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        selected.reported ? "bg-emerald-500" : "bg-amber-500"
                      }`}></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {selected.user.first_name} {selected.user.last_name}
                        </h3>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        {(() => {
                          const tour = tours.find((t) => t.id === selected.tour_id);
                          return (
                            <>
                              {tour?.poster_url && (
                                <img
                                  src={tour.poster_url}
                                  alt={tour.title}
                                  className="w-6 h-6 rounded object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = "/public/VieTour-Logo.png";
                                  }}
                                />
                              )}
                              <span className="text-sm text-gray-600">
                                {tour?.title || `Tour #${selected.tour_id}`}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(selected.created_at)}
                      </div>
                    </div>
                  </div>
                  <Separator className="bg-gray-200" />
                  <div className="text-lg text-gray-800 leading-relaxed p-4 bg-gray-50 rounded-lg border border-gray-100">
                    {selected.text}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-1 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center h-full p-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <MessageCircle className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Chưa chọn câu hỏi
                  </h3>
                  <p className="text-gray-500 text-center max-w-md">
                    Chọn một câu hỏi hoặc reply từ danh sách bên trái để xem chi tiết và trả lời
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Form reply cố định */}
            {(selected || selectedReply) && (
              <Card className="mt-4 bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4 w-[300px]">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <Send className="w-4 h-4 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-800">
                        Trả lời{" "}
                        {selectedReply
                          ? `cho reply #${selectedReply.id}`
                          : `cho câu hỏi #${selected?.id}`}
                      </h4>
                    </div>
                    
                    <div>
                      <textarea
                        className="h-[60px] w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 resize-none transition-all duration-200 bg-white/60 hover:bg-white/80 focus:bg-white"
                        rows={4}
                        placeholder={
                          selectedReply
                            ? "Nhập câu trả lời cho reply này..."
                            : "Nhập câu trả lời cho câu hỏi này..."
                        }
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button
                        className="gap-2 px-8 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        onClick={
                          selectedReply
                            ? () => handleReplyToReply(selectedReply.id)
                            : handleReplyToQuestion
                        }
                        disabled={!replyText.trim()}
                      >
                        <Send className="w-4 h-4" />
                        Gửi trả lời
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;

// CSS tùy chỉnh cho scrollbar
const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }
`;

// Thêm styles vào head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = customScrollbarStyles;
  document.head.appendChild(style);
}