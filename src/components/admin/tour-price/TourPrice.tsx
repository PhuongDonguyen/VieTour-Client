import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthContext } from "@/context/authContext";
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
  fetchAllTourPrices,
  deleteTourPriceService,
} from "@/services/tourPrice.service";
import type { TourPrice } from "@/apis/tourPrice.api";

const TourPricesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");

  const [tourPrices, setTourPrices] = useState<TourPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Helper function to get tour info
  const getTourInfo = (price: TourPrice) => {
    if (price.tour) {
      return {
        id: price.tour.id,
        title: price.tour.title,
        poster_url: price.tour.poster_url,
        category_name: price.tour.tour_category.name,
      };
    } else {
      return {
        id: price.tour_id,
        title: `Tour ID: ${price.tour_id}`,
        poster_url: "/avatar-default.jpg",
        category_name: "Unknown",
      };
    }
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} VND`;
  };

  // Fetch tour prices data from API
  const fetchTourPrices = async () => {
    setLoading(true);
    try {
      const res = await fetchAllTourPrices({
        page: currentPage,
        tour_id: tourIdFromUrl ? Number(tourIdFromUrl) : undefined,
      });

      setTourPrices(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } catch (error: any) {
      console.error("Error fetching tour prices:", error);

      // Show user-friendly error message
      if (error.response?.status === 400) {
        console.error(
          "API Error 400: Bad Request - The API endpoint may not be implemented yet"
        );
        // Show mock data for testing UI
        console.log("Showing mock data for UI testing...");
        setTourPrices([]);
        setTotalPages(1);
        setTotalItems(0);
      } else if (error.response?.status === 404) {
        console.error(
          "API Error 404: Not Found - The API endpoint does not exist"
        );
        setTourPrices([]);
        setTotalPages(1);
        setTotalItems(0);
      } else if (error.response?.status === 500) {
        console.error(
          "API Error 500: Internal Server Error - Backend server error"
        );
        setTourPrices([]);
        setTotalPages(1);
        setTotalItems(0);
      } else if (error.code === "ERR_NETWORK") {
        console.error("Network Error: Cannot connect to the server");
        setTourPrices([]);
        setTotalPages(1);
        setTotalItems(0);
      } else {
        setTourPrices([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourPrices();
  }, [currentPage, tourIdFromUrl]);

  // Handle view price
  const handleViewPrice = (price: TourPrice) => {
    navigate(`/admin/tours/prices/view/${price.id}`);
  };

  // Handle edit price
  const handleEditPrice = (price: TourPrice) => {
    if (isAdmin) {
      alert("Admin không có quyền chỉnh sửa.");
      return;
    }
    navigate(`/admin/tours/prices/edit/${price.id}`);
  };

  // Handle delete price
  const handleDeletePrice = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền xóa.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa giá tour này?")) {
      try {
        await deleteTourPriceService(id);
        fetchTourPrices();
      } catch (error: any) {
        console.error("Failed to delete tour price:", error);

        // Show user-friendly error message
        if (error.response?.status === 400) {
          console.error(
            "API Error 400: Bad Request - The delete API endpoint may not be implemented yet"
          );
          alert("API endpoint chưa được implement. Vui lòng thử lại sau.");
        } else if (error.response?.status === 404) {
          console.error(
            "API Error 404: Not Found - The tour price does not exist"
          );
          alert("Không tìm thấy thông tin giá tour. Vui lòng kiểm tra lại.");
        } else if (error.response?.status === 500) {
          console.error(
            "API Error 500: Internal Server Error - Backend server error"
          );
          alert("Lỗi server. Vui lòng thử lại sau.");
        } else if (error.code === "ERR_NETWORK") {
          console.error("Network Error: Cannot connect to the server");
          alert(
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
          );
        } else {
          alert("Không thể xóa giá tour. Vui lòng thử lại.");
        }
      }
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
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
          <div>
            <h1 className="text-3xl font-bold">Quản Lý Giá Tour</h1>
            <p className="text-muted-foreground">
              Quản lý bảng giá cho các tours ({totalItems} bảng giá)
              {isAdmin && (
                <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>
              )}
            </p>
          </div>
        </div>
        {!isAdmin && (
          <Button
            onClick={() =>
              navigate(
                tourIdFromUrl
                  ? `/admin/tours/prices/new?tour_id=${tourIdFromUrl}`
                  : "/admin/tours/prices/new"
              )
            }
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Giá Tour
          </Button>
        )}
      </div>

      {/* Tour Prices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Giá Tour</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-muted-foreground text-lg">
                Đang tải danh sách giá tour...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ghi Chú</TableHead>
                  <TableHead>Giá Người Lớn</TableHead>
                  <TableHead>Giá Trẻ Em</TableHead>
                  <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(tourPrices) && tourPrices.length > 0 ? (
                  tourPrices.map((price) => (
                    <TableRow key={price.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm text-muted-foreground">
                            {price.note || "Không có ghi chú"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(price.adult_price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-blue-600">
                          {formatCurrency(price.kid_price)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPrice(price)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditPrice(price)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePrice(price.id)}
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
                      {loading
                        ? "Đang tải..."
                        : "Không có bảng giá nào được tìm thấy."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {Array.isArray(tourPrices) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tourPrices) ? tourPrices.length : 0}{" "}
                trong tổng số {totalItems} bảng giá
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

export default TourPricesManagement;
