import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AuthContext } from "@/context/authContext";
import {
  fetchGeneralQuestions,
  deleteGeneralQuestion,
} from "@/services/generalQuestion.service";
import type { GeneralQuestion } from "@/apis/generalQuestion.api";
import { Eye, Edit, Trash2, Plus, ArrowLeft, HelpCircle } from "lucide-react";

const GeneralQuestionsManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const tourIdFromUrl = searchParams.get("tour_id");

  const [items, setItems] = useState<GeneralQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchGeneralQuestions({
        page: currentPage,
        limit: 10,
        search: search || undefined,
        tour_id: tourIdFromUrl ? Number(tourIdFromUrl) : undefined,
        sortBy: "id",
        sortOrder: "DESC",
      });
      setItems(res.data);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.totalItems || res.data.length || 0);
    } catch (err) {
      console.error("Failed to fetch general questions", err);
      setItems([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, tourIdFromUrl]);

  const handleDelete = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền xóa.");
      return;
    }
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;
    try {
      await deleteGeneralQuestion(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      setTotalItems((prev) => Math.max(prev - 1, 0));
    } catch (error) {
      console.error("Failed to delete general question", error);
      alert("Không thể xóa câu hỏi. Vui lòng thử lại.");
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {tourIdFromUrl && (
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/tours/view/${tourIdFromUrl}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại Tour
            </Button>
          )}
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-orange-600" />
            <div>
              <h1 className="text-3xl font-bold">Câu hỏi thường gặp</h1>
              <p className="text-muted-foreground">
                Danh sách câu hỏi chung cho tours ({totalItems} mục)
                {isAdmin && (
                  <span className="text-orange-600 ml-2">
                    (Chỉ xem - Admin)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        {!isAdmin && (
          <Button
            onClick={() =>
              navigate(
                tourIdFromUrl
                  ? `/admin/general-questions/new?tour_id=${tourIdFromUrl}`
                  : "/admin/general-questions/new"
              )
            }
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm câu hỏi
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <div className="flex gap-2 w-full md:w-96">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm câu hỏi hoặc câu trả lời..."
              />
              <Button
                onClick={() => {
                  setCurrentPage(1);
                  loadData();
                }}
              >
                Tìm
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-muted-foreground text-lg">Đang tải...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Câu hỏi</TableHead>
                  <TableHead>Trả lời</TableHead>
                  <TableHead>Tour</TableHead>
                  <TableHead>{isAdmin ? "Xem" : "Thao tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(items) && items.length > 0 ? (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell
                        className="max-w-xs truncate"
                        title={item.question}
                      >
                        {item.question}
                      </TableCell>
                      <TableCell
                        className="max-w-xs truncate"
                        title={item.answer}
                      >
                        {item.answer}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={item.tour?.poster_url || "/avatar-default.jpg"}
                            alt={item.tour?.title || `Tour ${item.tour_id}`}
                            className="w-10 h-7 object-cover rounded border"
                          />
                          <div className="text-sm">
                            <div className="font-medium">
                              {item.tour?.title || `Tour ID: ${item.tour_id}`}
                            </div>
                            {item.tour?.tour_category?.name && (
                              <Badge variant="secondary" className="text-xs">
                                {item.tour.tour_category.name}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              navigate(
                                `/admin/general-questions/view/${item.id}`
                              )
                            }
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  navigate(
                                    `/admin/general-questions/edit/${item.id}`
                                  )
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(item.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      {loading ? "Đang tải..." : "Không có dữ liệu."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {Array.isArray(items) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {items.length} trong tổng số {totalItems} câu hỏi
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Trước
                </Button>
                <span className="px-3 py-1 text-sm bg-muted rounded">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(p + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneralQuestionsManagement;
