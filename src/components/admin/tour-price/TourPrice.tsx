import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Edit, Trash2, Eye, Plus, DollarSign } from "lucide-react";
import { providerTourPriceService } from "../../../services/provider/providerTourPrice.service";
import { adminTourPriceService } from "../../../services/admin/adminTourPrice.service";
import type { TourPrice } from "../../../apis/provider/providerTourPrice.api";
import type { AdminTourPrice } from "../../../apis/admin/adminTourPrice.api";

const TourPricesManagement: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");

  const [tourPrices, setTourPrices] = useState<(TourPrice | AdminTourPrice)[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTourId, setSelectedTourId] = useState<string>(
    tourIdFromUrl || "all"
  );
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);

  // Helper functions to normalize data between TourPrice and AdminTourPrice
  const getTourInfo = (price: TourPrice | AdminTourPrice) => {
    // Handle case where tour property might be undefined
    if (price.tour) {
      return {
        id: price.tour.id,
        title: price.tour.title,
        poster_url: price.tour.poster_url,
        category_name: price.tour.tour_category.name,
      };
    } else {
      // Fallback for when tour info is not available
      const tourId = "tour_id" in price ? price.tour_id : 0;
      return {
        id: tourId,
        title: `Tour ID: ${tourId}`,
        poster_url: "/avatar-default.jpg",
        category_name: "Unknown",
      };
    }
  };

  const getChildPrice = (price: TourPrice | AdminTourPrice): number => {
    return "kid_price" in price ? price.kid_price : price.child_price;
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString()} VND`;
  };

  // Fetch tour prices data from API
  const fetchTourPrices = async () => {
    try {
      setLoading(true);

      let response;
      if (isAdmin) {
        // Use admin service to get all tour prices from all providers
        response = await adminTourPriceService.getAllTourPrices({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          tour_id:
            selectedTourId === "all" ? undefined : parseInt(selectedTourId),
        });
      } else {
        // Use provider service to get only provider's tour prices
        response = await providerTourPriceService.getTourPrices({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          tour_id:
            selectedTourId === "all" ? undefined : parseInt(selectedTourId),
        });
      }

      console.log("API response:", response);

      const pricesData = response.data || [];
      const paginationData = response.pagination || {
        totalPages: 1,
        totalItems: 0,
      };

      // Sort by tour title (handle undefined tour)
      const sortedPricesData = pricesData.sort(
        (a: TourPrice | AdminTourPrice, b: TourPrice | AdminTourPrice) => {
          const aTitle =
            a.tour?.title ||
            `Tour ID: ${"tour_id" in a ? a.tour_id : a.tour?.id || 0}`;
          const bTitle =
            b.tour?.title ||
            `Tour ID: ${"tour_id" in b ? b.tour_id : b.tour?.id || 0}`;
          return aTitle.localeCompare(bTitle, "vi", {
            sensitivity: "base",
          });
        }
      );

      // Extract unique tours for dropdown (handle undefined tour)
      const uniqueTours = pricesData.reduce(
        (
          acc: { id: number; title: string }[],
          price: TourPrice | AdminTourPrice
        ) => {
          const tourId =
            price.tour?.id || ("tour_id" in price ? price.tour_id : 0);
          const tourTitle = price.tour?.title || `Tour ID: ${tourId}`;

          if (!acc.find((tour) => tour.id === tourId)) {
            acc.push({ id: tourId, title: tourTitle });
          }
          return acc;
        },
        []
      );

      // Sort available tours by title
      const sortedTours = uniqueTours.sort(
        (a: { id: number; title: string }, b: { id: number; title: string }) =>
          a.title.localeCompare(b.title, "vi", { sensitivity: "base" })
      );

      setTourPrices(sortedPricesData);
      setAvailableTours(sortedTours);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch tour prices:", error);
      setTourPrices([]);
      setAvailableTours([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourPrices();
  }, [currentPage, searchTerm, selectedTourId]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view price
  const handleViewPrice = (price: TourPrice | AdminTourPrice) => {
    navigate(`/admin/tours/prices/view/${price.id}`);
  };

  // Handle edit price
  const handleEditPrice = (price: TourPrice | AdminTourPrice) => {
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
        await providerTourPriceService.deleteTourPrice(id);
        fetchTourPrices();
      } catch (error) {
        console.error("Failed to delete tour price:", error);
        alert("Không thể xóa giá tour. Vui lòng thử lại.");
      }
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Giá Tours</h1>
          <p className="text-muted-foreground">
            Quản lý bảng giá cho các tours ({totalItems} bảng giá)
            {isAdmin && (
              <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>
            )}
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={() => navigate("/admin/tours/prices/new")}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Giá Tour
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
                placeholder="Tìm kiếm theo tên tour hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
            <div className="w-72">
              <Select value={selectedTourId} onValueChange={setSelectedTourId}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn tour" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tours</SelectItem>
                  {availableTours.map((tour) => (
                    <SelectItem key={tour.id} value={tour.id.toString()}>
                      {tour.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour Prices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Giá Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour</TableHead>
                <TableHead>Giá Người Lớn</TableHead>
                <TableHead>Giá Trẻ Em</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(tourPrices) && tourPrices.length > 0 ? (
                tourPrices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={getTourInfo(price).poster_url}
                          alt={getTourInfo(price).title}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">
                            {getTourInfo(price).title}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-green-600">
                        {formatCurrency(price.adult_price)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-blue-600">
                        {formatCurrency(getChildPrice(price))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {getTourInfo(price).category_name}
                      </Badge>
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
                  <TableCell colSpan={5} className="text-center py-8">
                    {loading
                      ? "Đang tải..."
                      : "Không có bảng giá nào được tìm thấy."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

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
