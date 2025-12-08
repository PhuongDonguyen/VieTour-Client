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
import ApproveTourModal from "./ApproveTourModal";
import BanTourModal from "./BanTourModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Star,
  Users,
  Calendar,
  MapPin,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Ban,
  ShieldCheck,
} from "lucide-react";
import {
  fetchTours,
  deleteTourService,
  toggleTourStatusService,
  fetchToursUnapproved,
  approveTourService,
  bannedTourService,
  unbannedTourService,
  fetchToursBanned,
} from "@/services/tour.service";
import { fetchActiveTourCategories } from "@/services/tourCategory.service";
import { fetchAllProviderProfiles } from "@/services/providerProfile.service";
import { fetchRemainingSchedulesCount } from "@/services/tourSchedule.service";
import { toast } from "sonner";
import type { Tour } from "@/apis/tour.api";
import type { RemainingScheduleCount } from "@/apis/tourSchedule.api";

const ProviderTours: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Get category_id from URL parameter
  const categoryIdFromUrl = searchParams.get("category_id");

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState(""); // input value
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [tourCategories, setTourCategories] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    categoryIdFromUrl || "all"
  );
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProviderId, setSelectedProviderId] = useState<string>("all");
  const [selectedActiveStatus, setSelectedActiveStatus] =
    useState<string>("all");
  const [filteredTours, setFilteredTours] = useState<Tour[]>([]);
  const [loadingTourId, setLoadingTourId] = useState<number | null>(null);
  const [categoryMap, setCategoryMap] = useState<{ [key: number]: string }>({});
  const [remainingSchedules, setRemainingSchedules] = useState<
    RemainingScheduleCount[]
  >([]);
  const [refreshingSchedules, setRefreshingSchedules] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [showUnapprovedOnly, setShowUnapprovedOnly] = useState(false);
  const [showBannedOnly, setShowBannedOnly] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [tourToApprove, setTourToApprove] = useState<Tour | null>(null);
  const [banModalOpen, setBanModalOpen] = useState(false);
  const [tourToBan, setTourToBan] = useState<Tour | null>(null);
  const [isBanning, setIsBanning] = useState(false);

  // Set category filter from URL parameter on mount
  useEffect(() => {
    if (categoryIdFromUrl) {
      setSelectedCategoryId(categoryIdFromUrl);
    }
  }, [categoryIdFromUrl]);

  // Helper function to get category name
  const getCategoryName = (tour: Tour): string => {
    console.log("getCategoryName - tour:", tour);
    console.log("getCategoryName - tour.tour_category:", tour.tour_category);
    console.log(
      "getCategoryName - tour.tour_category_id:",
      tour.tour_category_id
    );
    console.log("getCategoryName - categoryMap:", categoryMap);

    if (tour.tour_category?.name) {
      console.log("Using tour.tour_category.name:", tour.tour_category.name);
      return tour.tour_category.name;
    }
    if (tour.tour_category_id && categoryMap[tour.tour_category_id]) {
      console.log("Using categoryMap:", categoryMap[tour.tour_category_id]);
      return categoryMap[tour.tour_category_id];
    }
    console.log(
      "Using fallback:",
      tour.tour_category_id
        ? `Category ${tour.tour_category_id}`
        : "Không xác định"
    );
    return tour.tour_category_id
      ? `Category ${tour.tour_category_id}`
      : "Không xác định";
  };

  // Helper functions to normalize data
  const getTourCapacity = (tour: Tour): number => {
    return tour.capacity || 0;
  };

  const getTourRating = (tour: Tour): number => {
    if (tour.total_star && tour.review_count && tour.review_count > 0) {
      return tour.total_star / tour.review_count;
    }
    return 0;
  };

  const getTourReviewCount = (tour: Tour): number => {
    return tour.review_count || 0;
  };

  const getTourBookedCount = (tour: Tour): number => {
    return tour.booked_count || 0;
  };

  const getTourViewCount = (tour: Tour): string => {
    const viewCount = tour.view_count;
    return typeof viewCount === "string"
      ? viewCount
      : viewCount?.toString() || "0";
  };

  const getTourTransportation = (tour: Tour): string => {
    return tour.transportation || "Không có thông tin";
  };

  const getTourAccommodation = (tour: Tour): string => {
    return tour.accommodation || "Không có thông tin";
  };

  const getTourDestinationIntro = (tour: Tour): string | null => {
    return tour.destination_intro || null;
  };

  const getTourInfo = (tour: Tour): string | null => {
    return tour.tour_info || null;
  };

  const getTourLiveCommentary = (tour: Tour): string | null => {
    return tour.live_commentary || null;
  };

  // Fetch tours data
  useEffect(() => {
    const fetchToursData = async () => {
      setLoading(true);
      try {
        let res;

        // Nếu đang xem tour chưa duyệt, sử dụng function riêng
        if (showUnapprovedOnly) {
          res = await fetchToursUnapproved(currentPage, 10);
          setTours(res.data);
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        } else if (showBannedOnly) {
          // Nếu đang xem tour bị cấm, sử dụng function riêng
          res = await fetchToursBanned(currentPage, 10);
          setTours(res.data);
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        } else {
          // Fetch tours bình thường
          const params: any = {
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
            tour_category_id:
              selectedCategoryId !== "all"
                ? Number(selectedCategoryId)
                : undefined,
            is_active:
              selectedActiveStatus !== "all"
                ? selectedActiveStatus === "active"
                : undefined,
          };

          // Debug: log user info
          console.log("User info:", {
            role: user?.role,
            provider_id: user?.provider_id,
            providerId: user?.providerId,
            id: user?.id,
            user: user,
          });

          // Thêm provider_id nếu role là provider hoặc admin chọn provider
          let providerId: number | null = null;
          if (user?.role === "provider") {
            // Kiểm tra nhiều trường hợp có thể có provider_id
            providerId = user?.provider_id || user?.providerId || user?.id;
          } else if (user?.role === "admin" && selectedProviderId !== "all") {
            // Admin chọn provider để filter
            providerId = Number(selectedProviderId);
          }

          if (providerId) {
            params.provider_id = providerId;
            console.log("Added provider_id to params:", providerId);
          } else {
            console.log(
              "Not adding provider_id - role:",
              user?.role,
              "providerId:",
              providerId
            );
          }

          console.log("Fetching tours with params:", params);
          res = await fetchTours(params);

          console.log("Tours data:", res.data); // Debug log to check structure
          setTours(res.data);
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        }
      } catch (error) {
        console.error("Error fetching tours:", error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchToursData();
  }, [
    currentPage,
    searchTerm,
    selectedCategoryId,
    selectedProviderId,
    selectedActiveStatus,
    showUnapprovedOnly,
    showBannedOnly,
    user?.role,
    user?.provider_id,
  ]);

  // FE search/filter - chỉ lọc theo search term, không lọc theo category (vì đã lọc ở backend)
  useEffect(() => {
    console.log("Filter effect - tours:", tours);
    console.log("Filter effect - selectedCategoryId:", selectedCategoryId);
    console.log("Filter effect - searchTerm:", searchTerm);

    let filtered = tours;

    // Chỉ lọc theo search term, không lọc theo category vì đã lọc ở backend
    if (searchTerm) {
      filtered = filtered.filter((tour) =>
        tour.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    console.log("Filter effect - filtered result:", filtered);
    setFilteredTours(filtered);
  }, [searchTerm, tours, selectedCategoryId]);

  // Debug: log selectedCategoryId when it changes
  useEffect(() => {
    console.log("selectedCategoryId changed to:", selectedCategoryId);
  }, [selectedCategoryId]);

  // Fetch tour categories
  const fetchTourCategoriesData = async () => {
    try {
      const categories = await fetchActiveTourCategories();
      setTourCategories(categories);
    } catch (error) {
      console.error("Error fetching tour categories:", error);
      setTourCategories([]);
    }
  };

  // Fetch providers for admin
  useEffect(() => {
    const fetchProvidersData = async () => {
      if (user?.role === "admin") {
        try {
          const providersRes = await fetchAllProviderProfiles({
            limit: 1000,
            is_verified: true,
          });
          setProviders(providersRes || []);
          console.log("Providers for admin:", providersRes);
        } catch (error) {
          console.error("Error fetching providers:", error);
          setProviders([]);
        }
      }
    };
    fetchProvidersData();
  }, [user?.role]);

  // Fetch remaining schedules count
  const fetchRemainingSchedules = async () => {
    try {
      setRefreshingSchedules(true);
      const response = await fetchRemainingSchedulesCount();
      setRemainingSchedules(response.data || []);
    } catch (error) {
      console.error("Error fetching remaining schedules count:", error);
      setRemainingSchedules([]);
    } finally {
      setRefreshingSchedules(false);
    }
  };

  useEffect(() => {
    const loadSchedules = async () => {
      setLoadingSchedules(true);
      await fetchRemainingSchedules();
      setLoadingSchedules(false);
    };
    loadSchedules();
  }, []);

  // Helper function to get remaining schedules count for a tour
  const getRemainingSchedulesForTour = (tourId: number): number => {
    const scheduleData = remainingSchedules.find((s) => s.tour_id === tourId);
    return scheduleData?.remaining_schedules || 0;
  };

  // Helper function to get color for remaining schedules badge
  const getRemainingSchedulesColor = (count: number): string => {
    if (count < 20) return "bg-red-500 hover:bg-red-600";
    if (count <= 50) return "bg-yellow-500 hover:bg-yellow-600";
    return "bg-green-500 hover:bg-green-600";
  };

  // Calculate summary statistics for remaining schedules
  const getRemainingSchedulesSummary = () => {
    const lowSchedules = remainingSchedules.filter(
      (s) => s.remaining_schedules < 20
    ).length;
    const mediumSchedules = remainingSchedules.filter(
      (s) => s.remaining_schedules >= 20 && s.remaining_schedules <= 50
    ).length;
    const highSchedules = remainingSchedules.filter(
      (s) => s.remaining_schedules > 50
    ).length;

    return { lowSchedules, mediumSchedules, highSchedules };
  };

  // Fetch tour categories on mount
  useEffect(() => {
    fetchActiveTourCategories().then((data) => {
      console.log("Loaded tour categories:", data);
      setTourCategories(data);
      // Build category map for quick lookup
      const map: { [key: number]: string } = {};
      data.forEach((cat: any) => {
        map[cat.id] = cat.name;
      });
      console.log("Built category map:", map);
      setCategoryMap(map);
    });
  }, []);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    setSearchTerm(value); // FE search only
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategoryId(value);
    // Không cần set loading vì lọc trên Frontend
  };

  const handleProviderChange = (value: string) => {
    setSelectedProviderId(value);
    setCurrentPage(1); // Reset to first page when changing provider
  };

  const handleActiveStatusChange = (value: string) => {
    setSelectedActiveStatus(value);
    setCurrentPage(1); // Reset to first page when changing active status
  };

  // Handle delete tour
  const handleDeleteTour = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền xóa tour.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa tour này?")) {
      try {
        await deleteTourService(id);
        // Refresh the tours list
        if (showUnapprovedOnly) {
          // Nếu đang xem tour chưa duyệt, sử dụng function riêng
          const res = await fetchToursUnapproved(currentPage, 10);
          setTours(res.data);
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        } else if (showBannedOnly) {
          // Nếu đang xem tour bị cấm, sử dụng function riêng
          const res = await fetchToursBanned(currentPage, 10);
          setTours(res.data);
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        } else {
          // Refresh tours bình thường
          const refreshParams: any = {
            page: currentPage,
            limit: 10,
            search: searchTerm || undefined,
            tour_category_id:
              selectedCategoryId !== "all"
                ? Number(selectedCategoryId)
                : undefined,
            is_active:
              selectedActiveStatus !== "all"
                ? selectedActiveStatus === "active"
                : undefined,
          };

          // Thêm provider_id nếu role là provider hoặc admin chọn provider
          let providerId: number | null = null;
          if (user?.role === "provider") {
            // Kiểm tra nhiều trường hợp có thể có provider_id
            providerId = user?.provider_id || user?.providerId || user?.id;
          } else if (user?.role === "admin" && selectedProviderId !== "all") {
            // Admin chọn provider để filter
            providerId = Number(selectedProviderId);
          }

          if (providerId) {
            refreshParams.provider_id = providerId;
          }

          const res = await fetchTours(refreshParams);
          setTours(res.data);
          setTotalPages(res.pagination.totalPages);
          setTotalItems(res.pagination.totalItems);
        }
      } catch (error) {
        console.error("Failed to delete tour:", error);
        alert("Không thể xóa tour. Vui lòng thử lại.");
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền thay đổi trạng thái tour.");
      return;
    }
    try {
      setLoadingTourId(id);
      await toggleTourStatusService(id);
      // Cập nhật trạng thái tour ngay trên FE, không fetch lại cả list
      setTours((prevTours) =>
        prevTours.map((tour) =>
          tour.id === id ? { ...tour, is_active: !tour.is_active } : tour
        )
      );
    } catch (error) {
      console.error("Failed to toggle tour status:", error);
      alert("Không thể thay đổi trạng thái tour. Vui lòng thử lại.");
    } finally {
      setLoadingTourId(null);
    }
  };

  // Handle view tour details
  const handleViewTour = (tour: Tour) => {
    navigate(`/admin/tours/view/${tour.id}`);
  };

  // Handle create tour
  const handleCreateTour = () => {
    if (isAdmin) {
      alert("Admin không có quyền tạo tour.");
      return;
    }
    navigate("/admin/tours/new");
  };

  // Handle edit tour
  const handleEditTour = (tour: Tour) => {
    if (isAdmin) {
      alert("Admin không có quyền chỉnh sửa tour.");
      return;
    }
    navigate(`/admin/tours/edit/${tour.id}`);
  };

  // Handle open approve modal
  const handleOpenApproveModal = (tour: Tour) => {
    if (!isAdmin) {
      alert("Chỉ admin mới có quyền duyệt tour.");
      return;
    }
    setTourToApprove(tour);
    setApproveModalOpen(true);
  };

  // Handle approve tour (only for admin)
  const handleApproveTour = async () => {
    if (!tourToApprove) return;

    try {
      setLoadingTourId(tourToApprove.id);
      await approveTourService(tourToApprove.id);
      // Refresh the tours list
      if (showUnapprovedOnly) {
        const res = await fetchToursUnapproved(currentPage, 10);
        setTours(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      } else if (showBannedOnly) {
        const res = await fetchToursBanned(currentPage, 10);
        setTours(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      } else {
        const refreshParams: any = {
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          tour_category_id:
            selectedCategoryId !== "all"
              ? Number(selectedCategoryId)
              : undefined,
          is_active:
            selectedActiveStatus !== "all"
              ? selectedActiveStatus === "active"
              : undefined,
        };

        let providerId: number | null = null;
        if (user?.role === "provider") {
          providerId = user?.provider_id || user?.providerId || user?.id;
        } else if (user?.role === "admin" && selectedProviderId !== "all") {
          providerId = Number(selectedProviderId);
        }

        if (providerId) {
          refreshParams.provider_id = providerId;
        }

        const res = await fetchTours(refreshParams);
        setTours(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
      setApproveModalOpen(false);
      setTourToApprove(null);
      toast.success("Duyệt tour thành công!");
    } catch (error) {
      console.error("Failed to approve tour:", error);
      toast.error("Không thể duyệt tour. Vui lòng thử lại.");
    } finally {
      setLoadingTourId(null);
    }
  };

  // Helper function to refresh tours list
  const refreshToursList = async () => {
    if (showUnapprovedOnly) {
      const res = await fetchToursUnapproved(currentPage, 10);
      setTours(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } else if (showBannedOnly) {
      const res = await fetchToursBanned(currentPage, 10);
      setTours(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } else {
      const refreshParams: any = {
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        tour_category_id:
          selectedCategoryId !== "all" ? Number(selectedCategoryId) : undefined,
        is_active:
          selectedActiveStatus !== "all"
            ? selectedActiveStatus === "active"
            : undefined,
      };

      let providerId: number | null = null;
      if (user?.role === "provider") {
        providerId = user?.provider_id || user?.providerId || user?.id;
      } else if (user?.role === "admin" && selectedProviderId !== "all") {
        providerId = Number(selectedProviderId);
      }

      if (providerId) {
        refreshParams.provider_id = providerId;
      }

      const res = await fetchTours(refreshParams);
      setTours(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    }
  };

  // Handle ban tour (only for admin)
  const handleBanTour = async () => {
    if (!tourToBan) return;
    if (!isAdmin) {
      toast.error("Chỉ admin mới có quyền cấm tour.");
      return;
    }

    try {
      setIsBanning(true);
      setLoadingTourId(tourToBan.id);
      await bannedTourService(tourToBan.id);
      setBanModalOpen(false);
      setTourToBan(null);
      await refreshToursList();
      toast.success("Cấm tour thành công!");
    } catch (error) {
      console.error("Failed to ban tour:", error);
      toast.error("Không thể cấm tour. Vui lòng thử lại.");
    } finally {
      setIsBanning(false);
      setLoadingTourId(null);
    }
  };

  // Handle unban tour (only for admin)
  const handleUnbanTour = async (tourId: number) => {
    if (!isAdmin) {
      toast.error("Chỉ admin mới có quyền gỡ cấm tour.");
      return;
    }

    try {
      setLoadingTourId(tourId);
      await unbannedTourService(tourId);
      await refreshToursList();
      toast.success("Gỡ cấm tour thành công!");
    } catch (error) {
      console.error("Failed to unban tour:", error);
      toast.error("Không thể gỡ cấm tour. Vui lòng thử lại.");
    } finally {
      setLoadingTourId(null);
    }
  };

  // Handle open ban modal
  const handleOpenBanModal = (tour: Tour) => {
    if (!isAdmin) {
      toast.error("Chỉ admin mới có quyền cấm tour.");
      return;
    }
    setTourToBan(tour);
    setBanModalOpen(true);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Tours</h1>
          <p className="text-muted-foreground">
            {showUnapprovedOnly ? (
              <>
                Tour chưa được duyệt ({totalItems} tours)
                {isAdmin && (
                  <span className="text-orange-600 ml-2">
                    (Chỉ xem - Admin)
                  </span>
                )}
                {user?.role === "provider" && (
                  <span className="text-orange-600 ml-2">(Đang chờ duyệt)</span>
                )}
              </>
            ) : showBannedOnly ? (
              <>
                Tour đã bị cấm ({totalItems} tours)
                {isAdmin && (
                  <span className="text-red-600 ml-2">(Chỉ xem - Admin)</span>
                )}
                {user?.role === "provider" && (
                  <span className="text-red-600 ml-2">(Tour bị cấm)</span>
                )}
              </>
            ) : (
              <>
                Quản lý tất cả tours của bạn ({totalItems} tours)
                {isAdmin && (
                  <span className="text-orange-600 ml-2">
                    (Chỉ xem - Admin)
                  </span>
                )}
              </>
            )}
          </p>
          {!loadingSchedules && remainingSchedules.length > 0 && (
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="font-medium">Tổng quan số lịch:</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white">
                  {getRemainingSchedulesSummary().lowSchedules}
                </Badge>
                <span>tours cần bổ sung gấp</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-white">
                  {getRemainingSchedulesSummary().mediumSchedules}
                </Badge>
                <span>tours cần bổ sung sớm</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">
                  {getRemainingSchedulesSummary().highSchedules}
                </Badge>
                <span>tours đủ lịch</span>
              </div>
            </div>
          )}
          {loadingSchedules && (
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Đang tải thông tin số lịch...</span>
            </div>
          )}
        </div>
        {/* Ẩn nút Thêm Tour Mới nếu là admin */}
        {!isAdmin && (
          <Button
            onClick={handleCreateTour}
            className="bg-black hover:bg-gray-800 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Tour Mới
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
                placeholder="Tìm kiếm theo tên tour..."
                value={searchInput}
                onChange={(e) => handleSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            {isAdmin && (
              <div className="w-44">
                <Select
                  value={selectedProviderId}
                  onValueChange={handleProviderChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Nhà cung cấp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả nhà cung cấp</SelectItem>
                    {providers.length > 0 ? (
                      providers.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.company_name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-providers" disabled>
                        Không có nhà cung cấp
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="w-44">
              <Select
                value={selectedCategoryId}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {tourCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-44">
              <Select
                value={selectedActiveStatus}
                onValueChange={handleActiveStatusChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái hoạt động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(isAdmin || user?.role === "provider") && (
              <>
                <Button
                  variant={showUnapprovedOnly ? "default" : "outline"}
                  onClick={() => {
                    setShowUnapprovedOnly(!showUnapprovedOnly);
                    setShowBannedOnly(false);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 ${
                    showUnapprovedOnly
                      ? "bg-orange-600 hover:bg-orange-700 text-white"
                      : ""
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  {showUnapprovedOnly
                    ? "Đang xem tour chưa duyệt"
                    : "Xem tour chưa duyệt"}
                </Button>
                <Button
                  variant={showBannedOnly ? "default" : "outline"}
                  onClick={() => {
                    setShowBannedOnly(!showBannedOnly);
                    setShowUnapprovedOnly(false);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-2 ${
                    showBannedOnly
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : ""
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  {showBannedOnly ? "Đang xem tour bị cấm" : "Xem tour bị cấm"}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Tours</CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="font-medium">Chú thích số lịch còn lại:</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-500 text-white">Dưới 20</Badge>
                <span>- Cần bổ sung gấp</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-yellow-500 text-white">20-50</Badge>
                <span>- Cần bổ sung sớm</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-green-500 text-white">Trên 50</Badge>
                <span>- Đủ lịch</span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRemainingSchedules}
              disabled={refreshingSchedules}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshingSchedules ? "animate-spin" : ""
                }`}
              />
              {refreshingSchedules ? "Đang làm mới..." : "Làm mới số lịch"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-muted-foreground text-lg">
                Đang tải danh sách tours...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hình Ảnh</TableHead>
                  <TableHead>Tên Tour</TableHead>
                  <TableHead className="text-center">Địa Điểm</TableHead>
                  <TableHead className="text-center">Danh Mục</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Số Lượng</TableHead>
                  <TableHead>Đánh Giá</TableHead>
                  <TableHead>Lượt Xem</TableHead>
                  <TableHead>Đã Đặt</TableHead>
                  <TableHead className="text-center">
                    Lịch Trình Còn Lại
                  </TableHead>
                  <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(filteredTours) && filteredTours.length > 0 ? (
                  filteredTours.map((tour) => (
                    <TableRow
                      key={tour.id}
                      className={loadingTourId === tour.id ? "opacity-60" : ""}
                    >
                      <TableCell>
                        <img
                          src={tour.poster_url}
                          alt={tour.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p
                            className="font-medium truncate max-w-[200px] cursor-pointer"
                            title={tour.title}
                          >
                            {tour.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {tour.duration} ngày
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span
                            className="truncate max-w-[120px]"
                            title={tour.location || "Chưa cập nhật"}
                          >
                            {tour.location || "Chưa cập nhật"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">
                          {getCategoryName(tour)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {tour.is_banned && !showBannedOnly && (
                            <Badge className="bg-red-600 text-white">
                              Bị cấm
                            </Badge>
                          )}
                          <Badge
                            variant={tour.is_active ? "default" : "secondary"}
                            className={
                              tour.is_active
                                ? "bg-green-500 hover:bg-green-500 text-white"
                                : "bg-gray-500 hover:bg-gray-500 text-white"
                            }
                          >
                            {tour.is_active ? "Hoạt động" : "Tạm dừng"}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          {getTourCapacity(tour)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {getTourRating(tour) > 0
                            ? `${getTourRating(tour).toFixed(1)}/5`
                            : "N/A"}
                          <span className="text-sm text-muted-foreground">
                            ({getTourReviewCount(tour)})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4 text-muted-foreground" />
                          {parseInt(getTourViewCount(tour)).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {getTourBookedCount(tour)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {loadingSchedules ? (
                          <div className="flex items-center justify-center gap-1">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-muted-foreground">
                              Đang tải...
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <Badge
                              variant="outline"
                              className={`${getRemainingSchedulesColor(
                                getRemainingSchedulesForTour(tour.id)
                              )} text-white`}
                              title={
                                getRemainingSchedulesForTour(tour.id) < 20
                                  ? "Ít hơn 20 lịch - Cần bổ sung gấp"
                                  : getRemainingSchedulesForTour(tour.id) <= 50
                                  ? "20-50 lịch - Cần bổ sung sớm"
                                  : "Trên 50 lịch - Đủ lịch"
                              }
                            >
                              {getRemainingSchedulesForTour(tour.id)}
                            </Badge>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTour(tour)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {/* Button approve tour - chỉ hiển thị cho admin khi xem tour chưa duyệt */}
                          {isAdmin && showUnapprovedOnly && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenApproveModal(tour)}
                              disabled={loadingTourId === tour.id}
                              className="text-green-600 hover:text-green-800 hover:bg-green-50"
                              title="Duyệt tour"
                            >
                              {loadingTourId === tour.id ? (
                                <span className="flex items-center">
                                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1"></span>
                                </span>
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          {/* Button ban/unban tour - chỉ hiển thị cho admin */}
                          {isAdmin && !showUnapprovedOnly && (
                            <>
                              {tour.is_banned ? (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleUnbanTour(tour.id)}
                                  disabled={loadingTourId === tour.id}
                                  className="text-green-600 hover:text-green-800 hover:bg-green-50"
                                  title="Gỡ cấm tour"
                                >
                                  {loadingTourId === tour.id ? (
                                    <span className="flex items-center">
                                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1"></span>
                                    </span>
                                  ) : (
                                    <ShieldCheck className="w-4 h-4" />
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleOpenBanModal(tour)}
                                  disabled={loadingTourId === tour.id}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                  title="Cấm tour"
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              )}
                            </>
                          )}
                          {/* Ẩn các nút Sửa, Xóa, Đổi trạng thái nếu là admin */}
                          {!isAdmin && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditTour(tour)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(tour.id)}
                                disabled={loadingTourId === tour.id}
                              >
                                {loadingTourId === tour.id ? (
                                  <span className="flex items-center">
                                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-1"></span>
                                    {tour.is_active ? "Tạm dừng" : "Kích hoạt"}
                                  </span>
                                ) : tour.is_active ? (
                                  "Tạm dừng"
                                ) : (
                                  "Kích hoạt"
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteTour(tour.id)}
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
                    <TableCell colSpan={11} className="text-center py-8">
                      {loading
                        ? "Đang tải..."
                        : "Không có tours nào được tìm thấy."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {Array.isArray(tours) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tours) ? tours.length : 0} trong tổng số{" "}
                {totalItems} tours
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

      {/* Approve Tour Modal */}
      <ApproveTourModal
        isOpen={approveModalOpen}
        tour={tourToApprove}
        loading={loadingTourId === tourToApprove?.id}
        onClose={() => {
          setApproveModalOpen(false);
          setTourToApprove(null);
        }}
        onConfirm={handleApproveTour}
        getCategoryName={getCategoryName}
      />

      {/* Ban Tour Modal */}
      <BanTourModal
        isOpen={banModalOpen}
        tour={tourToBan}
        loading={isBanning && loadingTourId === tourToBan?.id}
        onClose={() => {
          setBanModalOpen(false);
          setTourToBan(null);
        }}
        onConfirm={handleBanTour}
        getCategoryName={getCategoryName}
      />
    </div>
  );
};

export default ProviderTours;
