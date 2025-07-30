import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit, Trash2, Eye, Clock, Plus } from "lucide-react";
import { providerTourDetailService } from "../../../services/provider/providerTourDetail.service";
import { adminTourDetailService } from "../../../services/admin/adminTourDetail.service";
import { adminTourService } from "../../../services/admin/adminTour.service";
import type { TourDetail } from "../../../apis/provider/providerTourDetail.api";
import type { AdminTourDetail } from "../../../apis/admin/adminTourDetail.api";
import { AuthContext } from "../../../context/authContext";

const TourDetails: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");

  const [tourDetails, setTourDetails] = useState<
    (TourDetail | AdminTourDetail)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tours, setTours] = useState<{ id: number; title: string }[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>(
    tourIdFromUrl || "all"
  );
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);

  // Helper functions to normalize data between TourDetail and AdminTourDetail
  const getTourInfo = (detail: TourDetail | AdminTourDetail) => {
    // Handle case where tour property might be undefined
    if (detail.tour) {
      return {
        id: detail.tour.id,
        title: detail.tour.title,
        poster_url: detail.tour.poster_url,
        category_name: detail.tour.tour_category.name,
      };
    } else {
      // Fallback for when tour info is not available
      const tourId = "tour_id" in detail ? detail.tour_id : 0;
      return {
        id: tourId,
        title: `Tour ID: ${tourId}`,
        poster_url: "/avatar-default.jpg",
        category_name: "Unknown",
      };
    }
  };

  // Fetch tour details data
  const fetchTourDetails = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        const res = await adminTourDetailService.getAllTourDetails({
          page: currentPage,
          search: searchTerm,
          tour_id:
            selectedTourId !== "all" ? Number(selectedTourId) : undefined,
        });
        data = res.data;
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      } else {
        const res = await providerTourDetailService.getTourDetails({
          page: currentPage,
          search: searchTerm,
          tour_id:
            selectedTourId !== "all" ? Number(selectedTourId) : undefined,
        });
        data = res.data;
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
      setTourDetails(data);
    } catch (error) {
      setTourDetails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      // Lấy danh sách tour cho admin
      adminTourService.getAllTours({ page: 1, limit: 100 }).then((res) => {
        if (res.data && Array.isArray(res.data)) {
          setTours(res.data.map((t: any) => ({ id: t.id, title: t.title })));
        }
      });
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchTourDetails();
  }, [isAdmin, currentPage, searchTerm, selectedTourId]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view detail
  const handleViewDetail = (detail: TourDetail | AdminTourDetail) => {
    navigate(`/admin/tours/details/view/${detail.id}`);
  };

  // Handle edit detail
  const handleEditDetail = (detail: TourDetail | AdminTourDetail) => {
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
        await providerTourDetailService.deleteTourDetail(id);
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

  const handleTourChange = (tourId: string) => {
    setSelectedTourId(tourId);
    setLoading(true); // show loading until list update
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Chi Tiết Tours</h1>
          <p className="text-muted-foreground">
            Quản lý lịch trình chi tiết của các tours ({totalItems} chi tiết)
            {isAdmin && (
              <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>
            )}
          </p>
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

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm Kiếm & Bộ Lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tiêu đề chi tiết..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
            <div className="w-64">
              <Select value={selectedTourId} onValueChange={handleTourChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tour..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tours</SelectItem>
                  {tours.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <TableHead>Tour</TableHead>
                  <TableHead>Tiêu Đề</TableHead>
                  <TableHead>Thứ Tự</TableHead>
                  <TableHead>Danh Mục</TableHead>
                  <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(tourDetails) && tourDetails.length > 0 ? (
                  tourDetails.map((detail) => (
                    <TableRow key={detail.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img
                            src={getTourInfo(detail).poster_url}
                            alt={getTourInfo(detail).title}
                            className="w-12 h-8 object-cover rounded"
                          />
                          <div>
                            <p className="font-medium text-sm">
                              {getTourInfo(detail).title}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{detail.title}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Ngày {detail.order}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getTourInfo(detail).category_name}
                        </Badge>
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
                    <TableCell colSpan={5} className="text-center py-8">
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
