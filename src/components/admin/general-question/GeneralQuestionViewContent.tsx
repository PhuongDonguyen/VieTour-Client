import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, ExternalLink, HelpCircle, Eye } from "lucide-react";
import { AuthContext } from "@/context/authContext";
import { fetchGeneralQuestionById } from "@/services/generalQuestion.service";
import { fetchTourById } from "@/services/tour.service";

const GeneralQuestionViewContent: React.FC<{
  questionId?: string;
  onBack?: () => void;
  showHeader?: boolean;
}> = ({ questionId, onBack, showHeader = true }) => {
  const navigate = useNavigate();
  const { id: idFromParams } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const tourIdFromUrl = searchParams.get("tour_id");
  const actualId = questionId || idFromParams;

  const [item, setItem] = useState<any>(null);
  const [tour, setTour] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!actualId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchGeneralQuestionById(Number(actualId));
        setItem(data);
        if (data.tour_id) {
          try {
            const t = await fetchTourById(data.tour_id);
            setTour(t);
          } catch {
            setTour(null);
          }
        }
      } catch (e: any) {
        setError(e?.message || "Không tìm thấy câu hỏi");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [actualId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  if (error || !item) {
    return (
      <div className="text-red-600">{error || "Không tìm thấy câu hỏi."}</div>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={
                onBack
                  ? onBack
                  : () =>
                      navigate(
                        tourIdFromUrl || item?.tour_id
                          ? `/admin/general-questions?tour_id=${
                              tourIdFromUrl || item?.tour_id
                            }`
                          : "/admin/general-questions"
                      )
              }
              className="bg-white text-gray-800 hover:bg-gray-100 border border-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
            </Button>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-orange-600" />
              <h1 className="text-3xl font-bold">Chi tiết câu hỏi</h1>
            </div>
          </div>
          {/* No quick actions in header; moved to sidebar like Tour Image view */}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Câu hỏi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{item.question}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trả lời</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-foreground whitespace-pre-line">
                {item.answer}
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Thao tác nhanh</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isAdmin && (
                <Button
                  onClick={() =>
                    navigate(`/admin/general-questions/edit/${item.id}`)
                  }
                  className="w-full"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa câu hỏi
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/tours/view/${item.tour_id}`)}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Xem Tour
              </Button>
            </CardContent>
          </Card>

          {tour && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Tour</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-4">
                <img
                  src={tour.poster_url}
                  alt={tour.title}
                  className="w-20 h-14 object-cover rounded"
                />
                <div>
                  <div className="font-medium">{tour.title}</div>
                  {tour.tour_category?.name && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {tour.tour_category?.name}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeneralQuestionViewContent;
