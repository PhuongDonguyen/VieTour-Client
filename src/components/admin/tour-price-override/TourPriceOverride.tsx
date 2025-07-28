import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  Trash2,
  Eye,
  Plus,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Clock,
  Edit,
  Loader2,
} from "lucide-react";
import { providerTourPriceOverrideService } from "../../../services/provider/providerTourPriceOverride.service";
import { adminTourPriceOverrideService } from "../../../services/admin/adminTourPriceOverride.service";
import type { TourPriceOverride } from "../../../apis/provider/providerTourPriceOverride.api";
import type { AdminTourPriceOverride } from "../../../apis/admin/adminTourPriceOverride.api";
import TourPriceOverrideViewContent from "./TourPriceOverrideViewContent";
import TourPriceOverrideEditor from "./TourPriceOverrideEditor";

const TourPriceOverridesManagement: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [priceOverrides, setPriceOverrides] = useState<
    (TourPriceOverride | AdminTourPriceOverride)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOverride, setSelectedOverride] = useState<
    TourPriceOverride | AdminTourPriceOverride | null
  >(null);
  const [selectedOverrideType, setSelectedOverrideType] =
    useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);
  const [availableTourPrices, setAvailableTourPrices] = useState<
    { id: number; tour_title: string; adult_price: number }[]
  >([]);
  const [mode, setMode] = useState<"list" | "view" | "edit" | "create">("list");
  const [selectedOverrideId, setSelectedOverrideId] = useState<string | null>(
    null
  );
  const [loadingActiveIds, setLoadingActiveIds] = useState<number[]>([]);

  // Fetch price overrides data from API
  const fetchPriceOverrides = async () => {
    try {
      setLoading(true);

      let response;
      if (isAdmin) {
        // Admin uses admin service
        response = await adminTourPriceOverrideService.getAllTourPriceOverrides(
          {
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
            override_type:
              selectedOverrideType === "all"
                ? undefined
                : (selectedOverrideType as any),
            is_active:
              selectedStatus === "all" ? undefined : selectedStatus === "true",
          }
        );
      } else {
        // Provider uses provider service
        response = await providerTourPriceOverrideService.getTourPriceOverrides(
          {
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
            override_type:
              selectedOverrideType === "all" ? undefined : selectedOverrideType,
            is_active:
              selectedStatus === "all" ? undefined : selectedStatus === "true",
          }
        );
      }

      console.log("API response:", response);

      const overridesData = response.data || [];
      const paginationData = response.pagination || {
        totalPages: 1,
        totalItems: 0,
      };

      // Sort by tour title, then by override date
      const sortedOverridesData = overridesData.sort(
        (
          a: TourPriceOverride | AdminTourPriceOverride,
          b: TourPriceOverride | AdminTourPriceOverride
        ) => {
          const tourCompare = a.tour_price.tour.title.localeCompare(
            b.tour_price.tour.title,
            "vi",
            { sensitivity: "base" }
          );
          if (tourCompare !== 0) return tourCompare;

          // Compare dates (handle nulls)
          const aDate = a.override_date || a.start_date || "9999-12-31";
          const bDate = b.override_date || b.start_date || "9999-12-31";
          return new Date(aDate).getTime() - new Date(bDate).getTime();
        }
      );

      // Extract unique tours for dropdown
      const uniqueTours = overridesData.reduce(
        (
          acc: { id: number; title: string }[],
          override: TourPriceOverride | AdminTourPriceOverride
        ) => {
          if (!acc.find((tour) => tour.id === override.tour_price.tour.id)) {
            acc.push({
              id: override.tour_price.tour.id,
              title: override.tour_price.tour.title,
            });
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

      setPriceOverrides(sortedOverridesData);
      setAvailableTours(sortedTours);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch price overrides:", error);
      setPriceOverrides([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceOverrides();
  }, [currentPage, searchTerm, selectedOverrideType, selectedStatus]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view override
  const handleViewOverride = (
    override: TourPriceOverride | AdminTourPriceOverride
  ) => {
    setSelectedOverrideId(override.id.toString());
    setMode("view");
  };

  // Handle toggle active
  const handleToggleActive = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền thay đổi trạng thái.");
      return;
    }
    setLoadingActiveIds((prev) => [...prev, id]);
    try {
      await providerTourPriceOverrideService.toggleActive(id);
      // Cập nhật local state thay vì reload toàn bộ list
      setPriceOverrides((prevOverrides) =>
        prevOverrides.map((override) =>
          override.id === id
            ? { ...override, is_active: !override.is_active }
            : override
        )
      );
    } catch (error) {
      console.error("Failed to toggle active status:", error);
      alert("Không thể thay đổi trạng thái. Vui lòng thử lại.");
    } finally {
      setLoadingActiveIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Handle delete override
  const handleDeleteOverride = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền xóa.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa ghi đè giá này?")) {
      try {
        await providerTourPriceOverrideService.deleteTourPriceOverride(id);
        // Cập nhật local state thay vì reload toàn bộ list
        setPriceOverrides((prevOverrides) =>
          prevOverrides.filter((override) => override.id !== id)
        );
      } catch (error) {
        console.error("Failed to delete price override:", error);
        alert("Không thể xóa ghi đè giá. Vui lòng thử lại.");
      }
    }
  };

  const handleEditOverride = (
    override: TourPriceOverride | AdminTourPriceOverride
  ) => {
    if (isAdmin) {
      alert("Admin không có quyền chỉnh sửa giá đặc biệt.");
      return;
    }
    setSelectedOverrideId(override.id.toString());
    setMode("edit");
  };

  const handleCreateOverride = () => {
    if (isAdmin) {
      alert("Admin không có quyền tạo giá đặc biệt.");
      return;
    }
    setSelectedOverrideId(null);
    setMode("create");
  };

  const handleBack = () => {
    setMode("list");
    setSelectedOverrideId(null);
    fetchPriceOverrides(); // reload lại list nếu cần
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " VND";
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get override type text
  const getOverrideTypeText = (type: string) => {
    switch (type) {
      case "single_date":
        return "Ngày cụ thể";
      case "date_range":
        return "Khoảng thời gian";
      case "weekly":
        return "Theo thứ";
      default:
        return type;
    }
  };

  // Get override type variant
  const getOverrideTypeVariant = (type: string) => {
    switch (type) {
      case "single_date":
        return "default";
      case "date_range":
        return "secondary";
      case "weekly":
        return "outline";
      default:
        return "outline";
    }
  };

  // Get date display for override
  const getDateDisplay = (
    override: TourPriceOverride | AdminTourPriceOverride
  ) => {
    if (override.override_type === "single_date" && override.override_date) {
      return formatDate(override.override_date);
    }
    if (
      override.override_type === "date_range" &&
      override.start_date &&
      override.end_date
    ) {
      return `${formatDate(override.start_date)} - ${formatDate(
        override.end_date
      )}`;
    }
    if (override.override_type === "weekly" && override.day_of_week) {
      // Map từ tiếng Anh lowercase sang tiếng Việt để hiển thị
      const dayMap: { [key: string]: string } = {
        monday: "Thứ 2",
        tuesday: "Thứ 3",
        wednesday: "Thứ 4",
        thursday: "Thứ 5",
        friday: "Thứ 6",
        saturday: "Thứ 7",
        sunday: "Chủ nhật",
      };
      return dayMap[override.day_of_week] || override.day_of_week;
    }
    return "Chưa xác định";
  };

  return (
    <div className="space-y-6">
      {mode === "list" && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">
                {isAdmin
                  ? "Quản Lý Price Overrides (Admin)"
                  : "Quản Lý Ghi Đè Giá Tours"}
              </h1>
              <p className="text-muted-foreground">
                {isAdmin
                  ? `Xem tất cả price overrides trong hệ thống (${totalItems} quy tắc) - Chỉ xem`
                  : `Quản lý các quy tắc ghi đè giá theo ngày và thời gian (${totalItems} quy tắc)`}
              </p>
            </div>
            {!isAdmin && (
              <Button
                onClick={handleCreateOverride}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Ghi Đè Giá
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
                <div className="w-48">
                  <Select
                    value={selectedOverrideType}
                    onValueChange={setSelectedOverrideType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Loại ghi đè" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại</SelectItem>
                      <SelectItem value="single_date">Ngày cụ thể</SelectItem>
                      <SelectItem value="date_range">
                        Khoảng thời gian
                      </SelectItem>
                      <SelectItem value="day_of_week">Theo thứ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-40">
                  <Select
                    value={selectedStatus}
                    onValueChange={setSelectedStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="true">Kích hoạt</SelectItem>
                      <SelectItem value="false">Tạm ngưng</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Overrides Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh Sách Ghi Đè Giá Tours</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
                  <span className="text-muted-foreground text-lg">
                    Đang tải danh sách ghi đè giá...
                  </span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tour</TableHead>
                      <TableHead>Thời Gian Áp Dụng</TableHead>
                      <TableHead>Loại Ghi Đè</TableHead>
                      <TableHead>Giá Người Lớn</TableHead>
                      <TableHead>Giá Trẻ Em</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(priceOverrides) &&
                    priceOverrides.length > 0 ? (
                      priceOverrides.map((override) => (
                        <TableRow key={override.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={override.tour_price.tour.poster_url}
                                alt={override.tour_price.tour.title}
                                className="w-12 h-8 object-cover rounded"
                              />
                              <div>
                                <p className="font-medium text-sm">
                                  {override.tour_price.tour.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Giá gốc:{" "}
                                  {formatCurrency(
                                    override.tour_price.adult_price
                                  )}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-blue-600" />
                              <div>
                                <p className="font-medium text-sm">
                                  {getDateDisplay(override)}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={getOverrideTypeVariant(
                                override.override_type
                              )}
                            >
                              {getOverrideTypeText(override.override_type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-green-700">
                              {formatCurrency(override.adult_price)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-blue-700">
                              {formatCurrency(override.kid_price)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  override.is_active ? "default" : "secondary"
                                }
                              >
                                {override.is_active ? "Kích hoạt" : "Tạm ngưng"}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOverride(override)}
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!isAdmin && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditOverride(override)}
                                    title="Chỉnh sửa"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleToggleActive(override.id)
                                    }
                                    disabled={loadingActiveIds.includes(
                                      override.id
                                    )}
                                    title={
                                      override.is_active
                                        ? "Tạm ngưng"
                                        : "Kích hoạt"
                                    }
                                    className={
                                      override.is_active
                                        ? "text-orange-600 hover:text-orange-800"
                                        : "text-green-600 hover:text-green-800"
                                    }
                                  >
                                    {loadingActiveIds.includes(override.id) ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : override.is_active ? (
                                      <ToggleRight className="w-4 h-4" />
                                    ) : (
                                      <ToggleLeft className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleDeleteOverride(override.id)
                                    }
                                    className="text-red-600 hover:text-red-800"
                                    title="Xóa ghi đè"
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
                        <TableCell colSpan={7} className="text-center py-8">
                          <div className="flex flex-col items-center space-y-2">
                            <Calendar className="w-12 h-12 text-muted-foreground/50" />
                            <p className="text-muted-foreground">
                              Không có quy tắc ghi đè giá nào được tìm thấy.
                            </p>
                            <p className="text-sm text-muted-foreground/70">
                              Thử thay đổi bộ lọc hoặc tạo quy tắc mới.
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {Array.isArray(priceOverrides) && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    {Array.isArray(priceOverrides) ? priceOverrides.length : 0}{" "}
                    trong tổng số {totalItems} quy tắc
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
        </>
      )}
      {mode === "view" && selectedOverrideId && (
        <TourPriceOverrideViewContent
          overrideId={selectedOverrideId}
          onBack={handleBack}
          showHeader={true}
          onEdit={(id) => {
            setSelectedOverrideId(id.toString());
            setMode("edit");
          }}
        />
      )}
      {mode === "edit" && selectedOverrideId && (
        <TourPriceOverrideEditor
          mode="edit"
          id={selectedOverrideId}
          onBack={handleBack}
        />
      )}
      {mode === "create" && (
        <TourPriceOverrideEditor mode="create" onBack={handleBack} />
      )}
    </div>
  );
};

export default TourPriceOverridesManagement;
