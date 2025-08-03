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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Eye,
  Plus,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Edit,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  fetchAllTourPriceOverrides,
  deleteTourPriceOverrideService,
  toggleActiveTourPriceOverrideService,
} from "../../../services/tourPriceOverride.service";
import { fetchTourById } from "../../../services/tour.service";
import type { TourPriceOverride } from "../../../apis/tourPriceOverride.api";
import TourPriceOverrideViewContent from "./TourPriceOverrideViewContent";
import TourPriceOverrideEditor from "./TourPriceOverrideEditor";

const TourPriceOverridesList: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [allPriceOverrides, setAllPriceOverrides] = useState<
    TourPriceOverride[]
  >([]);
  const [filteredPriceOverrides, setFilteredPriceOverrides] = useState<
    TourPriceOverride[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOverrideType, setSelectedOverrideType] =
    useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [mode, setMode] = useState<"list" | "view" | "edit" | "create">("list");
  const [selectedOverrideId, setSelectedOverrideId] = useState<string | null>(
    null
  );
  const [loadingActiveIds, setLoadingActiveIds] = useState<number[]>([]);
  const [tourInfo, setTourInfo] = useState<{
    id: number;
    title: string;
  } | null>(null);

  // Lấy tour_id từ URL
  const tourIdFromUrl = searchParams.get("tour_id");

  // Fetch tour info
  useEffect(() => {
    if (tourIdFromUrl) {
      fetchTourById(parseInt(tourIdFromUrl)).then((res) => {
        setTourInfo({
          id: res.id,
          title: res.title,
        });
      });
    }
  }, [tourIdFromUrl]);

  // Fetch price overrides data from API
  const fetchPriceOverrides = async () => {
    setLoading(true);
    try {
      const overrideType =
        selectedOverrideType !== "all"
          ? (selectedOverrideType as "single_date" | "date_range" | "weekly")
          : undefined;

      const res = await fetchAllTourPriceOverrides({
        page: currentPage,
        override_type: overrideType,
        is_active:
          selectedStatus !== "all" ? selectedStatus === "true" : undefined,
        tour_id: tourIdFromUrl ? parseInt(tourIdFromUrl) : undefined,
      });

      setAllPriceOverrides(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } catch (error) {
      setAllPriceOverrides([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter price overrides based on selectedOverrideType, selectedStatus
  useEffect(() => {
    let filtered = allPriceOverrides;
    if (selectedOverrideType !== "all") {
      filtered = filtered.filter(
        (item) => item.override_type === selectedOverrideType
      );
    }
    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (item) => String(item.is_active) === selectedStatus
      );
    }
    setFilteredPriceOverrides(filtered);
  }, [allPriceOverrides, selectedOverrideType, selectedStatus]);

  useEffect(() => {
    fetchPriceOverrides();
  }, [currentPage, selectedOverrideType, selectedStatus, tourIdFromUrl]);

  // Handle view override
  const handleViewOverride = (override: TourPriceOverride) => {
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
      await toggleActiveTourPriceOverrideService(id);
      // Cập nhật local state thay vì reload toàn bộ list
      setAllPriceOverrides((prevOverrides) =>
        prevOverrides.map((override) =>
          override.id === id
            ? { ...override, is_active: !override.is_active }
            : override
        )
      );
      setFilteredPriceOverrides((prevOverrides) =>
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
        await deleteTourPriceOverrideService(id);
        // Cập nhật local state thay vì reload toàn bộ list
        setAllPriceOverrides((prevOverrides) =>
          prevOverrides.filter((override) => override.id !== id)
        );
        setFilteredPriceOverrides((prevOverrides) =>
          prevOverrides.filter((override) => override.id !== id)
        );
      } catch (error) {
        console.error("Failed to delete price override:", error);
        alert("Không thể xóa ghi đè giá. Vui lòng thử lại.");
      }
    }
  };

  const handleEditOverride = (override: TourPriceOverride) => {
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
  const getDateDisplay = (override: TourPriceOverride) => {
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
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(`/admin/tours/view/${tourIdFromUrl}`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Trở về Tour
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  {isAdmin
                    ? "Quản Lý Price Overrides (Admin)"
                    : "Quản Lý Ghi Đè Giá Tours"}
                </h1>
                <p className="text-muted-foreground">
                  {tourInfo
                    ? `Giá đặc biệt cho tour: ${tourInfo.title} (${totalItems} quy tắc)`
                    : `Quản lý các quy tắc ghi đè giá theo ngày và thời gian (${totalItems} quy tắc)`}
                </p>
              </div>
            </div>
            {!isAdmin && (
              <Button
                onClick={handleCreateOverride}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Ghi Đè Giá
              </Button>
            )}
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Bộ Lọc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-4">
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
                      <SelectItem value="weekly">Theo thứ</SelectItem>
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
                      <TableHead>Thời Gian Áp Dụng</TableHead>
                      <TableHead>Loại Ghi Đè</TableHead>
                      <TableHead>Giá Người Lớn</TableHead>
                      <TableHead>Giá Trẻ Em</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(filteredPriceOverrides) &&
                    filteredPriceOverrides.length > 0 ? (
                      filteredPriceOverrides.map((override) => (
                        <TableRow key={override.id}>
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
                        <TableCell colSpan={6} className="text-center py-8">
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
              {Array.isArray(filteredPriceOverrides) && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    {Array.isArray(filteredPriceOverrides)
                      ? filteredPriceOverrides.length
                      : 0}{" "}
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

export default TourPriceOverridesList;
