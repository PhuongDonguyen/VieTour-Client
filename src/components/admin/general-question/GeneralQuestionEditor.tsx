import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save, HelpCircle } from "lucide-react";
import {
  createGeneralQuestion,
  fetchGeneralQuestionById,
  updateGeneralQuestion,
} from "@/services/generalQuestion.service";
import { fetchTours } from "@/services/tour.service";

interface FormState {
  tour_id: number | string;
  question: string;
  answer: string;
}

const GeneralQuestionEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tourIdFromUrl = searchParams.get("tour_id");

  const isEditing = !!id;

  const [form, setForm] = useState<FormState>({
    tour_id: tourIdFromUrl ? parseInt(tourIdFromUrl) : 0,
    question: "",
    answer: "",
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);
  const [loadingTours, setLoadingTours] = useState<boolean>(false);

  const loadAvailableTours = async () => {
    try {
      setLoadingTours(true);
      const response = await fetchTours({ page: 1, limit: 100 });
      let toursData: any[] = [];
      if (response && typeof response === "object") {
        if (Array.isArray((response as any).data))
          toursData = (response as any).data;
        else if (Array.isArray(response)) toursData = response as any[];
      }
      setAvailableTours(
        toursData.sort((a, b) =>
          a.title.localeCompare(b.title, "vi", { sensitivity: "base" })
        )
      );
    } catch (e) {
      setAvailableTours([]);
    } finally {
      setLoadingTours(false);
    }
  };

  const loadData = async () => {
    if (!isEditing || !id) return;
    try {
      setLoading(true);
      const data = await fetchGeneralQuestionById(parseInt(id));
      setForm({
        tour_id: data.tour_id,
        question: data.question,
        answer: data.answer,
      });
    } catch (e: any) {
      setError(e?.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tourIdFromUrl) {
      loadAvailableTours();
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tourIdFromUrl]);

  const handleSave = async () => {
    if (!form.tour_id || !form.question.trim() || !form.answer.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isEditing && id) {
        await updateGeneralQuestion(parseInt(id), {
          question: form.question,
          answer: form.answer,
          tour_id: Number(form.tour_id),
        });
      } else {
        await createGeneralQuestion({
          tour_id: Number(form.tour_id),
          question: form.question,
          answer: form.answer,
        });
      }
      navigate(
        tourIdFromUrl || form.tour_id
          ? `/admin/general-questions?tour_id=${tourIdFromUrl || form.tour_id}`
          : "/admin/general-questions"
      );
    } catch (e: any) {
      setError(e?.message || "Không thể lưu dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() =>
              navigate(
                tourIdFromUrl || form.tour_id
                  ? `/admin/general-questions?tour_id=${
                      tourIdFromUrl || form.tour_id
                    }`
                  : "/admin/general-questions"
              )
            }
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold">
                {isEditing ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
              </h1>
              <p className="text-muted-foreground">
                {isEditing
                  ? "Cập nhật câu hỏi thường gặp"
                  : "Tạo câu hỏi thường gặp cho tour"}
              </p>
            </div>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading
            ? isEditing
              ? "Đang lưu..."
              : "Đang tạo..."
            : isEditing
            ? "Lưu thay đổi"
            : "Tạo mới"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin câu hỏi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Tour *</Label>
                {tourIdFromUrl ? (
                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">
                      Tour ID: {tourIdFromUrl}
                    </p>
                  </div>
                ) : (
                  <select
                    className="w-full border rounded h-10 px-3 text-sm"
                    value={String(form.tour_id)}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        tour_id: Number(e.target.value),
                      }))
                    }
                    disabled={loadingTours || isEditing}
                  >
                    <option value={0} disabled>
                      {loadingTours ? "Đang tải..." : "Chọn tour..."}
                    </option>
                    {availableTours.map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="question">Câu hỏi *</Label>
                <Input
                  id="question"
                  value={form.question}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, question: e.target.value }))
                  }
                  placeholder="Nhập câu hỏi"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Trả lời *</Label>
                <textarea
                  id="answer"
                  value={form.answer}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, answer: e.target.value }))
                  }
                  className="w-full min-h-[120px] rounded border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Nhập câu trả lời"
                />
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>Tour: {form.tour_id ? form.tour_id : "Chưa chọn"}</div>
              <div>Độ dài câu hỏi: {form.question.length} ký tự</div>
              <div>Độ dài trả lời: {form.answer.length} ký tự</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GeneralQuestionEditor;
