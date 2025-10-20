import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AuthContext } from "@/context/authContext";
import { fetchAllToursByProviderId } from "@/services/tour.service";
import { fetchQuestionsByTourId, sendQuestion } from "@/services/question.service";
import { updateReported } from "@/apis/question.api";
import { MessageCircle, Send, Search, User, Clock, ChevronLeft, ChevronRight, Check } from "lucide-react";

type UserProfile = {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string | null;
};

type Question = {
  id: number;
  user_id: number | null;
  tour_id: number;
  parent_question_id: number | null;
  text: string;
  created_at: string;
  reported: boolean;
  user: UserProfile | null;
  questions?: Question[];
};

type TourItem = { id: number; title: string; poster_url?: string };

const templates: Record<string, string> = {
  thank:
    "Cảm ơn bạn đã quan tâm! Chúng tôi rất vui được hỗ trợ thêm khi cần.",
  apologize:
    "Rất xin lỗi vì sự bất tiện. Chúng tôi đã ghi nhận và sẽ cải thiện ngay.",
  info:
    "Cảm ơn bạn. Vui lòng cho biết thêm thông tin để chúng tôi tư vấn chi tiết.",
  resolve:
    "Chúng tôi đã xử lý vấn đề này. Cảm ơn bạn đã phản hồi!",
};

function formatRelative(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  return `${days} ngày trước`;
}

const AdminRepComment: React.FC = () => {
  const { user } = useContext(AuthContext);

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const [tours, setTours] = useState<TourItem[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [selectedTour, setSelectedTour] = useState<TourItem | null>(null);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selected, setSelected] = useState<Question | null>(null);
  const [replyText, setReplyText] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "replied">("all");

  const sendingRef = useRef(false);

  useEffect(() => {
    const loadTours = async () => {
      try {
        const res = await fetchAllToursByProviderId(user?.id || null, 1, 50);
        setTours((res.data || []).map((t: any) => ({ id: t.id, title: t.title, poster_url: t.poster_url })));
      } catch (e) {
        console.error(e);
      }
    };
    loadTours();
  }, [user?.id]);

  useEffect(() => {
    const loadQuestions = async () => {
      if (!selectedTourId) {
        setQuestions([]);
        setSelected(null);
        return;
      }
      try {
        const res = await fetchQuestionsByTourId(selectedTourId);
        setQuestions(res.data || []);
      } catch (e) {
        console.error(e);
        setQuestions([]);
      }
    };
    loadQuestions();
  }, [selectedTourId]);

  const pendingCount = useMemo(
    () => questions.filter((q) => !q.questions || q.questions.length === 0).length,
    [questions]
  );

  const filteredQuestions = useMemo(() => {
    let list = questions;
    if (filter !== "all") {
      list = list.filter((q) =>
        filter === "replied" ? (q.questions && q.questions.length > 0) : !(q.questions && q.questions.length > 0)
      );
    }
    if (search) {
      const term = search.toLowerCase();
      list = list.filter((q) => {
        const author = q.user ? `${q.user.first_name} ${q.user.last_name}`.toLowerCase() : "";
        return author.includes(term) || q.text.toLowerCase().includes(term);
      });
    }
    return list;
  }, [questions, filter, search]);

  const handleSendReply = async () => {
    if (!selected || !replyText.trim() || sendingRef.current) return;
    try {
      sendingRef.current = true;
      const res = await sendQuestion(null, selected.tour_id, selected.id, replyText.trim(), true);
      // Append reply locally
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === selected.id ? { ...q, reported: true, questions: [...(q.questions || []), res.data] } : q
        )
      );
      await updateReported(true, selected.id);
      setReplyText("");
    } catch (e) {
      console.error("Reply failed", e);
    } finally {
      sendingRef.current = false;
    }
  };

  const handleTourSelect = (tour: TourItem) => {
    setSelectedTourId(tour.id);
    setSelectedTour(tour);
    setCurrentStep(2);
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    setSelectedTourId(null);
    setSelectedTour(null);
    setQuestions([]);
    setSelected(null);
    setReplyText("");
  };

  return (
    <div className="p-6">
      {/* Header với Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-gray-800">
            <MessageCircle className="h-5 w-5" />
            <span className="font-semibold">Quản lý bình luận</span>
            {selectedTour && (
              <span className="text-sm text-gray-500">• {selectedTour.title}</span>
            )}
          </div>
          {currentStep === 2 && (
            <div className="text-sm text-gray-600">
              <span className="mr-4">{questions.length} bình luận</span>
              <span className="text-amber-600">{pendingCount} chờ phản hồi</span>
            </div>
          )}
        </div>

        {/* Stepper Progress */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 1 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : '1'}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
              }`}>
                Chọn tour
              </span>
            </div>

            {/* Connector */}
            <div className={`w-16 h-0.5 ${
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
            }`} />

            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= 2 
                  ? 'bg-blue-600 border-blue-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                2
              </div>
              <span className={`ml-2 text-sm font-medium ${
                currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
              }`}>
                Trả lời bình luận
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {currentStep === 1 ? (
        <Step1SelectTour 
          tours={tours} 
          onTourSelect={handleTourSelect}
        />
      ) : (
        <Step2ReplyComments 
          selectedTour={selectedTour}
          questions={questions}
          filteredQuestions={filteredQuestions}
          selected={selected}
          replyText={replyText}
          search={search}
          filter={filter}
          pendingCount={pendingCount}
          onBack={handleBackToStep1}
          onSearchChange={setSearch}
          onFilterChange={setFilter}
          onQuestionSelect={setSelected}
          onReplyTextChange={setReplyText}
          onSendReply={handleSendReply}
        />
      )}
    </div>
  );
};

// Step 1: Chọn tour
const Step1SelectTour: React.FC<{
  tours: TourItem[];
  onTourSelect: (tour: TourItem) => void;
}> = ({ tours, onTourSelect }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-gray-800">Chọn tour để quản lý bình luận</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tours.map((tour) => (
              <div
                key={tour.id}
                onClick={() => onTourSelect(tour)}
                className="p-4 border rounded-lg cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
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
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg">
                        {tour.title[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                      {tour.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Tour #{tour.id}</p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
          {tours.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Chưa có tour nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Step 2: Trả lời bình luận
const Step2ReplyComments: React.FC<{
  selectedTour: TourItem | null;
  questions: Question[];
  filteredQuestions: Question[];
  selected: Question | null;
  replyText: string;
  search: string;
  filter: "all" | "pending" | "replied";
  pendingCount: number;
  onBack: () => void;
  onSearchChange: (value: string) => void;
  onFilterChange: (value: "all" | "pending" | "replied") => void;
  onQuestionSelect: (question: Question) => void;
  onReplyTextChange: (value: string) => void;
  onSendReply: () => void;
}> = ({
  selectedTour,
  questions,
  filteredQuestions,
  selected,
  replyText,
  search,
  filter,
  pendingCount,
  onBack,
  onSearchChange,
  onFilterChange,
  onQuestionSelect,
  onReplyTextChange,
  onSendReply,
}) => {
  return (
    <div>
      {/* Back button */}
      <div className="mb-4">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Quay lại chọn tour
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Danh sách bình luận */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b">
            <CardTitle className="text-gray-900">Bình luận khách hàng</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => onFilterChange("all")}>
                Tất cả
              </Button>
              <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => onFilterChange("pending")}>
                Chờ phản hồi
              </Button>
              <Button variant={filter === "replied" ? "default" : "outline"} size="sm" onClick={() => onFilterChange("replied")}>
                Đã phản hồi
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Tìm kiếm bình luận..." className="pl-9" />
            </div>

            <div className="max-h-[560px] overflow-y-auto space-y-2 pr-1">
              {filteredQuestions.map((q) => (
                <div
                  key={q.id}
                  onClick={() => onQuestionSelect(q)}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${
                    selected?.id === q.id ? "bg-gray-50 border-gray-300" : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {q.user?.avatar ? (
                      <img src={q.user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-900 truncate">
                          {q.user ? `${q.user.first_name} ${q.user.last_name}` : "Khách"}
                        </div>
                        {q.questions && q.questions.length > 0 ? (
                          <Badge variant="secondary">Đã trả lời</Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">Chờ phản hồi</Badge>
                        )}
                        <div className="ml-auto flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatRelative(q.created_at)}
                        </div>
                      </div>
                      <div className="text-gray-700 text-sm mt-1 line-clamp-2">{q.text}</div>
                      {q.questions && q.questions.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">{q.questions.length} phản hồi</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {selectedTour && filteredQuestions.length === 0 && (
                <div className="text-center text-gray-500 py-8">Không có bình luận phù hợp</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Khung trả lời */}
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-gray-900">Soạn phản hồi</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {selected ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg border bg-gray-50">
                  <div className="flex items-start gap-3">
                    {selected.user?.avatar ? (
                      <img src={selected.user.avatar} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900 truncate">
                          {selected.user ? `${selected.user.first_name} ${selected.user.last_name}` : "Khách"}
                        </div>
                        <span className="text-xs text-gray-500">{formatRelative(selected.created_at)}</span>
                      </div>
                      <div className="text-gray-800 text-sm mt-1">{selected.text}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Phản hồi của bạn</label>
                  <Textarea
                    placeholder="Nhập phản hồi..."
                    value={replyText}
                    onChange={(e) => onReplyTextChange(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button variant="outline" onClick={() => onReplyTextChange(templates.thank)}>Cảm ơn</Button>
                  <Button variant="outline" onClick={() => onReplyTextChange(templates.apologize)}>Xin lỗi</Button>
                  <Button variant="outline" onClick={() => onReplyTextChange(templates.info)}>Thêm thông tin</Button>
                  <Button variant="outline" onClick={() => onReplyTextChange(templates.resolve)}>Đã xử lý</Button>
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={onSendReply} disabled={!replyText.trim()} className="px-5">
                    <Send className="w-4 h-4" /> Gửi phản hồi
                  </Button>
                  <Button variant="outline" onClick={() => { onQuestionSelect(null as any); onReplyTextChange(""); }}>Hủy</Button>
                </div>
              </div>
            ) : (
              <div className="h-[360px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p>Chọn một bình luận để trả lời</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminRepComment;


