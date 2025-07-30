import React, { use, useEffect, useState, useContext } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
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
} from "lucide-react";
import { fetchAllToursByProviderId } from "@/services/tour.service";
import { AuthContext } from "@/context/authContext";

// Interface theo cấu trúc API thực tế
interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface Question {
  id: number;
  user_id: number;
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
}

// Mock data theo cấu trúc API thực tế với nested replies
const mockQuestions: Question[] = [
  {
    id: 47,
    user_id: 27,
    tour_id: 1,
    parent_question_id: null,
    text: "Alo",
    created_at: "2025-07-22T10:34:02.748Z",
    reported: false,
    user: {
      id: 27,
      first_name: "Phi",
      last_name: "Duong",
      avatar:
        "https://res.cloudinary.com/dxiuxuivf/image/upload/v1753291188/vietour/bjmiqfxa5imzgns1u8h6.jpg",
    },
    questions: [
      {
        id: 50,
        user_id: 23,
        tour_id: 1,
        parent_question_id: 47,
        text: "Nghe",
        created_at: "2025-07-22T10:40:00.000Z",
        reported: false,
        user: {
          id: 23,
          first_name: "Đỗ Nguyên",
          last_name: "Hoàng Phương",
          avatar:
            "https://res.cloudinary.com/dxiuxuivf/image/upload/v1753064159/vietour/qcke0mul85qdme87obmo.jpg",
        },
        questions: [
          {
            id: 51,
            user_id: 27,
            tour_id: 1,
            parent_question_id: 50,
            text: "Cảm ơn bạn đã trả lời!",
            created_at: "2025-07-22T10:45:00.000Z",
            reported: false,
            user: {
              id: 27,
              first_name: "Phi",
              last_name: "Duong",
              avatar:
                "https://res.cloudinary.com/dxiuxuivf/image/upload/v1753291188/vietour/bjmiqfxa5imzgns1u8h6.jpg",
            },
            questions: [
              {
                id: 52,
                user_id: 23,
                tour_id: 1,
                parent_question_id: 51,
                text: "Không có gì!",
                created_at: "2025-07-22T10:50:00.000Z",
                reported: false,
                user: {
                  id: 23,
                  first_name: "Đỗ Nguyên",
                  last_name: "Hoàng Phương",
                  avatar:
                    "https://res.cloudinary.com/dxiuxuivf/image/upload/v1753064159/vietour/qcke0mul85qdme87obmo.jpg",
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 48,
    user_id: 28,
    tour_id: 2,
    parent_question_id: null,
    text: "Tour này có bao gồm vé máy bay không?",
    created_at: "2025-07-22T11:00:00.000Z",
    reported: false,
    user: {
      id: 28,
      first_name: "Nguyễn",
      last_name: "Văn A",
      avatar: "",
    },
    questions: [
      {
        id: 53,
        user_id: 23,
        tour_id: 2,
        parent_question_id: 48,
        text: "Chào bạn! Tour này không bao gồm vé máy bay, bạn cần tự mua riêng.",
        created_at: "2025-07-22T11:05:00.000Z",
        reported: false,
        user: {
          id: 23,
          first_name: "Đỗ Nguyên",
          last_name: "Hoàng Phương",
          avatar:
            "https://res.cloudinary.com/dxiuxuivf/image/upload/v1753064159/vietour/qcke0mul85qdme87obmo.jpg",
        },
        questions: [
          {
            id: 54,
            user_id: 28,
            tour_id: 2,
            parent_question_id: 53,
            text: "Vậy giá vé máy bay khoảng bao nhiêu?",
            created_at: "2025-07-22T11:10:00.000Z",
            reported: false,
            user: {
              id: 28,
              first_name: "Nguyễn",
              last_name: "Văn A",
              avatar: "",
            },
          },
        ],
      },
    ],
  },
];

// Mock tours data
const mockTours: Tour[] = [
  {
    id: 1,
    title: "Tour Hà Nội - Sapa 3 ngày 2 đêm",
    poster_url: "https://example.com/tour1.jpg",
  },
  {
    id: 2,
    title: "Tour Đà Nẵng - Hội An - Huế 4 ngày 3 đêm",
    poster_url: "https://example.com/tour2.jpg",
  },
  {
    id: 3,
    title: "Tour Phú Quốc 3 ngày 2 đêm",
    poster_url: "https://example.com/tour3.jpg",
  },
];

const AdminSupport: React.FC = () => {
  const { user } = useContext(AuthContext);

  // State cho tours
  const [selectedTour, setSelectedTour] = useState<number | "all">("all");

  // State cho UI
  const [selected, setSelected] = useState<Question | null>(null);
  const [selectedReply, setSelectedReply] = useState<Question | null>(null);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [expandedReplies, setExpandedReplies] = useState<Set<number>>(
    new Set()
  );

  const [tours, setTours] = useState<Tour[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Lấy provider_id từ user context
  const providerId = user?.id || null;

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const res = await fetchAllToursByProviderId(providerId);
        console.log("Fetched tours:", res);
        setTours(res.data || []);
      } catch (error) {
        console.error("Error fetching tours:", error);
      }
    };
    fetchTours();
  }, []);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        if (selectedTour === "all") {
          // setQuestions(mockQuestions);
          return;
        }
        const res = await fetchQuestionsByTourId(selectedTour);
        console.log("Fetched questions:", res);
        setQuestions(res.data || []);
      } catch (error) {
        console.error("Error fetching questions:", error);
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
  };

  const handleReplyToQuestion = async () => {
    // Logic trả lời câu hỏi gốc
    console.log("Trả lời câu hỏi gốc:", selected, replyText);
    try {
      if (!selected || !replyText.trim()) return;

      const res = await sendQuestion(
        null,
        selected.tour_id,
        selected.id,
        replyText,
        true
      );
      console.log("Reply to question response:", res);
    } catch (error) {
      console.error("Error replying to question:", error);
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
      const res = await sendQuestion(
        null,
        selectedReply!.tour_id,
        replyId,
        replyText,
        true
      );
      console.log("Reply to question response:", res);
    } catch (error) {
      console.error("Error replying to question:", error);
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
                {reply.user.avatar ? (
                  <img
                    src={reply.user.avatar}
                    alt="avatar"
                    className="w-4 h-4 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4 text-primary" />
                )}
                <div className="font-medium flex-1">
                  {reply.user.first_name} {reply.user.last_name}
                  {/* {reply.user_id === 23 && (
                    <span className="ml-1 text-primary">(Admin)</span>
                  )} */}
                </div>
                {/* Badge trạng thái cho reply */}
                {reply.reported ? (
                  <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                    Đã trả lời
                  </Badge>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1 py-0 h-4 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-xs shadow-sm border border-yellow-300">
                    <svg
                      className="w-3 h-3"
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
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý câu hỏi</h1>
          <p className="text-gray-600 mt-2">
            Trả lời câu hỏi từ khách hàng về các tour
          </p>
          <p className="text-sm text-green-600 mt-1">
            ✓ Đã load {filteredQuestions.length} câu hỏi
            {selectedTour !== "all" && ` cho tour được chọn`}
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm câu hỏi, tên khách hàng hoặc tour..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="sm:w-48">
              {/* <label htmlFor='filter-select' className="block text-sm font-medium text-gray-700 mb-2">

              </label> */}
              <select
                id="filter-select"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </Card>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
        <Card className="w-full max-w-xs">
          <CardContent className="p-4">
            <h2 className="text-base font-semibold mb-3">Danh sách tour</h2>

            {/* Khung cuộn */}
            <div className="max-h-110 overflow-y-auto pr-1">
              <div className="flex flex-col divide-y divide-gray-200">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    onClick={() => {
                      const value = tour.id;
                      setSelectedTour(value);
                      handleTourChange(value);
                    }}
                    className={`flex items-center gap-3 py-2 cursor-pointer hover:bg-gray-100 rounded-lg px-2 ${
                      selectedTour === tour.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-xs">
                      {tour.title[0]}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tour.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        Mã tour: {tour.id}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">➔</div>
                  </div>
                ))}
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
                  {selectedTour !== "all" && (
                    <Button
                      onClick={() => handleTourChange("all")}
                      variant="outline"
                      className="mt-4"
                    >
                      Xem tất cả tour
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                {filteredQuestions.map((q) => (
                  <div key={q.id}>
                    {/* Câu hỏi chính */}
                    <Card
                      className={`cursor-pointer ${
                        selected?.id === q.id ? "border-primary" : ""
                      }`}
                      onClick={() => handleSelectQuestion(q)}
                    >
                      <CardContent className="flex gap-3 items-center p-3">
                        {q.user.avatar ? (
                          <img
                            src={q.user.avatar}
                            alt="avatar"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-primary" />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold">
                            {q.user.first_name} {q.user.last_name}
                          </div>
                          <div className="text-sm text-muted-foreground truncate">
                            {q.text}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {mockTours.find((t) => t.id === q.tour_id)?.title ||
                              `Tour #${q.tour_id}`}
                          </div>
                        </div>
                        {/* Badge trạng thái */}

                        {q.reported ? (
                          <Badge variant="secondary">Đã trả lời {q.reported}</Badge>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-semibold text-xs shadow-sm border border-yellow-300">
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
                      </CardContent>
                    </Card>

                    {/* Replies mở rộng bên dưới câu hỏi */}
                    {q.questions && q.questions.length > 0 && (
                      <div className="ml-4 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleReplies(q.id);
                          }}
                          className="w-full justify-start gap-1 text-xs"
                        >
                          {expandedReplies.has(q.id) ? (
                            <>
                              <ChevronUp className="w-3 h-3" />
                              Thu gọn ({countTotalReplies(
                                q.questions || []
                              )}{" "}
                              trả lời)
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-3 h-3" />
                              Mở rộng ({countTotalReplies(
                                q.questions || []
                              )}{" "}
                              trả lời)
                            </>
                          )}
                        </Button>

                        {expandedReplies.has(q.id) && (
                          <RenderNestedReplies replies={q.questions || []} />
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
              <Card className="flex-1">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    {selectedReply.user.avatar ? (
                      <img
                        src={selectedReply.user.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                    <div>
                      <div className="font-bold">
                        {selectedReply.user.first_name}{" "}
                        {selectedReply.user.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Reply #{selectedReply.id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(selectedReply.created_at)}
                      </div>
                      {/* {selectedReply.user_id === 23 && (
                        <Badge variant="secondary" className="mt-1">
                          Admin
                        </Badge>
                      )} */}
                    </div>
                  </div>
                  <Separator />
                  <div className="text-lg">{selectedReply.text}</div>
                </CardContent>
              </Card>
            ) : selected ? (
              <Card className="flex-1">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    {selected.user.avatar ? (
                      <img
                        src={selected.user.avatar}
                        alt="avatar"
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary" />
                    )}
                    <div>
                      <div className="font-bold">
                        {selected.user.first_name} {selected.user.last_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {mockTours.find((t) => t.id === selected.tour_id)
                          ?.title || `Tour #${selected.tour_id}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(selected.created_at)}
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="text-lg">{selected.text}</div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <MessageCircle className="w-16 h-16 mb-4" />
                <div>
                  Chọn một câu hỏi hoặc reply để xem chi tiết và trả lời
                </div>
              </div>
            )}

            {/* Form reply cố định */}
            {(selected || selectedReply) && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trả lời{" "}
                        {selectedReply
                          ? `cho reply #${selectedReply.id}`
                          : `cho câu hỏi #${selected?.id}`}
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
                        className="gap-2 px-6"
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
