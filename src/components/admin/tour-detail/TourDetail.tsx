import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Eye, Plus, ArrowLeft } from "lucide-react";
import {
  fetchAllTourDetails,
  deleteTourDetailService,
} from "@/services/tourDetail.service";
import type { TourDetail } from "@/apis/tourDetail.api";
import { AuthContext } from "@/context/authContext";

const TourDetails: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");

  const [tourDetails, setTourDetails] = useState<TourDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTourId, setSelectedTourId] = useState<string>(
    tourIdFromUrl || "all"
  );

  // Fetch tour details data
  const fetchTourDetails = async () => {
    setLoading(true);
    try {
      const res = await fetchAllTourDetails({
        page: currentPage,
        tour_id: selectedTourId !== "all" ? Number(selectedTourId) : undefined,
      });

      setTourDetails(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } catch (error) {
      console.error("Error fetching tour details:", error);
      setTourDetails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourDetails();
  }, [currentPage, selectedTourId]);

  // Handle view detail
  const handleViewDetail = (detail: TourDetail) => {
    navigate(`/admin/tours/details/view/${detail.id}`);
  };

  // Handle edit detail
  const handleEditDetail = (detail: TourDetail) => {
    if (isAdmin) {
      alert("Admin không có quyền chỉnh sửa chi tiết tour.");
      return;
    }
    navigate(`/admin/tours/details/edit/${detail.id}`);
  };

  // Handle delete detail
  const handleDeleteDetail = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền xóa chi tiết tour.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa chi tiết tour này?")) {
      try {
        await deleteTourDetailService(id);
        fetchTourDetails();
      } catch (error) {
        console.error("Failed to delete tour detail:", error);
        alert("Không thể xóa chi tiết tour. Vui lòng thử lại.");
      }
    }
  };

  // Handle create new detail
  const handleCreateDetail = () => {
    if (isAdmin) {
      alert("Admin không có quyền tạo chi tiết tour.");
      return;
    }
    navigate("/admin/tours/details/new");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/tours/view/${selectedTourId}`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Trở về Tour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Quản Lý Chi Tiết Tours</h1>
            <p className="text-muted-foreground">
              Quản lý lịch trình chi tiết của các tours ({totalItems} chi tiết)
              {isAdmin && (
                <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>
              )}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <Button
            onClick={handleCreateDetail}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Chi Tiết Tour
          </Button>
        )}
      </div>

      {/* Tour Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Chi Tiết Tours</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-muted-foreground text-lg">
                Đang tải danh sách chi tiết tour...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tiêu Đề</TableHead>
                  <TableHead>Thứ Tự</TableHead>
                  <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(tourDetails) && tourDetails.length > 0 ? (
                  tourDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <p className="font-medium">{detail.title}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Ngày {detail.order}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(detail)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditDetail(detail)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteDetail(detail.id)}
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
                    <TableCell colSpan={3} className="text-center py-8">
                      {loading
                        ? "Đang tải..."
                        : "Không có chi tiết tour nào được tìm thấy."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {Array.isArray(tourDetails) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tourDetails) ? tourDetails.length : 0}{" "}
                trong tổng số {totalItems} chi tiết
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
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

export default TourDetails;
