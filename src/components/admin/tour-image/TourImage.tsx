import React, { useState, useEffect, useContext } from "react";
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
  ImageIcon,
  Star,
  StarOff,
  ExternalLink,
  Edit,
  Loader2,
} from "lucide-react";
import { providerTourImageService } from "../../../services/provider/providerTourImage.service";
import { adminTourImageService } from "../../../services/admin/adminTourImage.service";
import { providerTourService } from "../../../services/provider/providerTour.service";
import { adminTourService } from "../../../services/admin/adminTour.service";
import type { TourImage } from "../../../apis/provider/providerTourImage.api";
import type { AdminTourImage } from "../../../apis/admin/adminTourImage.api";
import { useNavigate, useSearchParams } from "react-router-dom";
import LargeModal from "@/components/LargeModal";
import TourImageViewContent from "./TourImageViewContent";
import TourImageEditor from "./TourImageEditor";

const TourImagesManagement: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const [searchParams] = useSearchParams();

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");

  const [allTourImages, setAllTourImages] = useState<
    (TourImage | AdminTourImage)[]
  >([]);
  const [filteredTourImages, setFilteredTourImages] = useState<
    (TourImage | AdminTourImage)[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedImage, setSelectedImage] = useState<
    TourImage | AdminTourImage | null
  >(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewImageId, setViewImageId] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [tours, setTours] = useState<{ id: number; title: string }[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>(
    tourIdFromUrl || "all"
  );
  const [selectedFeatured, setSelectedFeatured] = useState<string>("all");
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);
  const [mode, setMode] = useState<"list" | "view" | "edit" | "create">("list");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [loadingFeaturedIds, setLoadingFeaturedIds] = useState<number[]>([]);
  const [loadingTours, setLoadingTours] = useState(false);

  const navigate = useNavigate();

  // Helper functions to normalize data between TourImage and AdminTourImage
  const getTourInfo = (image: TourImage | AdminTourImage) => {
    // Both TourImage and AdminTourImage have tour property with same structure
    return {
      id: image.tour.id,
      title: image.tour.title,
      poster_url: image.tour.poster_url,
      category_name: image.tour.tour_category.name,
    };
  };

  const getAltText = (image: TourImage | AdminTourImage): string => {
    return "alt_text" in image
      ? image.alt_text
      : image.description || "Tour image";
  };

  const getTourId = (image: TourImage | AdminTourImage): number => {
    return "tour_id" in image ? image.tour_id : image.tour.id;
  };

  // Load available tours
  const loadAvailableTours = async () => {
    try {
      setLoadingTours(true);
      const response = await providerTourService.getTours({
        page: 1,
        limit: 100,
        status: "active",
      });

      let toursData: any[] = [];
      if (response && typeof response === "object") {
        if (response.data && Array.isArray(response.data)) {
          toursData = response.data;
        } else if (Array.isArray(response)) {
          toursData = response;
        } else if (
          "success" in response &&
          "data" in response &&
          Array.isArray(response.data)
        ) {
          toursData = response.data;
        }
      }

      // Sort tours by title
      const sortedTours = toursData.sort((a, b) =>
        a.title.localeCompare(b.title, "vi", { sensitivity: "base" })
      );

      setAvailableTours(sortedTours);
    } catch (error) {
      console.error("Failed to load tours:", error);
      setAvailableTours([]);
    } finally {
      setLoadingTours(false);
    }
  };

  // Fetch tour images data
  const fetchTourImages = async () => {
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        const res = await adminTourImageService.getAllTourImages({
          page: currentPage,
          search: searchTerm,
          tour_id:
            selectedTourId !== "all" ? Number(selectedTourId) : undefined,
          is_featured:
            selectedFeatured !== "all"
              ? selectedFeatured === "true"
              : undefined,
        });
        data = res.data;
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      } else {
        const res = await providerTourImageService.getTourImages({
          page: currentPage,
          search: searchTerm,
          tour_id:
            selectedTourId !== "all" ? Number(selectedTourId) : undefined,
          is_featured:
            selectedFeatured !== "all"
              ? selectedFeatured === "true"
              : undefined,
        });
        data = res.data;
        setTotalPages(res.pagination.totalPages);
        setTotalItems(res.pagination.totalItems);
      }
      setAllTourImages(data);
    } catch (error) {
      setAllTourImages([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter images based on selectedFeatured
  useEffect(() => {
    let filtered = allTourImages;

    // Filter by featured status
    if (selectedFeatured !== "all") {
      const isFeatured = selectedFeatured === "true";
      filtered = filtered.filter((image) => image.is_featured === isFeatured);
    }

    setFilteredTourImages(filtered);
  }, [allTourImages, selectedFeatured]);

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
    loadAvailableTours();
    fetchTourImages();
  }, [isAdmin, currentPage, searchTerm, selectedTourId, selectedFeatured]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view image
  const handleViewImage = (image: TourImage | AdminTourImage) => {
    setSelectedImageId(image.id.toString());
    setMode("view");
  };

  const handleEditImage = (image: TourImage | AdminTourImage) => {
    setSelectedImageId(image.id.toString());
    setMode("edit");
  };

  const handleCreateImage = () => {
    setSelectedImageId(null);
    setMode("create");
  };

  const handleBack = () => {
    setMode("list");
    setSelectedImageId(null);
    fetchTourImages(); // reload lại list nếu cần
  };

  // Handle toggle featured
  const handleToggleFeatured = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền thay đổi trạng thái.");
      return;
    }
    setLoadingFeaturedIds((prev) => [...prev, id]);
    try {
      await providerTourImageService.toggleFeatured(id);
      // Cập nhật local state thay vì reload toàn bộ list
      setAllTourImages((prevImages) =>
        prevImages.map((image) =>
          image.id === id
            ? { ...image, is_featured: !image.is_featured }
            : image
        )
      );
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
      alert("Không thể thay đổi trạng thái nổi bật. Vui lòng thử lại.");
    } finally {
      setLoadingFeaturedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Handle delete image
  const handleDeleteImage = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền xóa.");
      return;
    }
    if (window.confirm("Bạn có chắc chắn muốn xóa hình ảnh này?")) {
      try {
        await providerTourImageService.deleteTourImage(id);
        // Cập nhật local state thay vì reload toàn bộ list
        setAllTourImages((prevImages) =>
          prevImages.filter((image) => image.id !== id)
        );
        setTotalItems((prev) => prev - 1);
      } catch (error) {
        console.error("Failed to delete tour image:", error);
        alert("Không thể xóa hình ảnh. Vui lòng thử lại.");
      }
    }
  };

  // Handle image error
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const img = e.target as HTMLImageElement;
    img.src = "/avatar-default.jpg"; // Fallback image
  };

  return (
    <div className="space-y-6">
      {mode === "list" && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Quản Lý Hình Ảnh Tours</h1>
              <p className="text-muted-foreground">
                Quản lý thư viện hình ảnh và ảnh nổi bật của các tours (
                {totalItems} hình ảnh)
                {isAdmin && (
                  <span className="text-orange-600 ml-2">
                    (Chỉ xem - Admin)
                  </span>
                )}
              </p>
            </div>
            {!isAdmin && (
              <Button
                onClick={handleCreateImage}
                className="bg-black hover:bg-gray-800 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm Hình Ảnh
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
                    placeholder="Tìm kiếm theo tên tour hoặc mô tả ảnh..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 max-w-sm"
                  />
                </div>
                <div className="w-56">
                  <Select
                    value={selectedTourId}
                    onValueChange={(value) => {
                      setSelectedTourId(value);
                      setCurrentPage(1); // Reset to first page when filter changes
                    }}
                    disabled={loadingTours}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={loadingTours ? "Đang tải..." : "Chọn tour"}
                      />
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
                <div className="w-40">
                  <Select
                    value={selectedFeatured}
                    onValueChange={(value) => {
                      setSelectedFeatured(value);
                      setCurrentPage(1); // Reset to first page when filter changes
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="true">Nổi bật</SelectItem>
                      <SelectItem value="false">Thường</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tour Images Table */}
          <Card>
            <CardHeader>
              <CardTitle>Danh Sách Hình Ảnh Tours</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
                  <span className="text-muted-foreground text-lg">
                    Đang tải danh sách hình ảnh...
                  </span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hình Ảnh</TableHead>
                      <TableHead>Tour</TableHead>
                      <TableHead>Mô Tả</TableHead>
                      <TableHead>Trạng Thái</TableHead>
                      <TableHead>Danh Mục</TableHead>
                      <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(filteredTourImages) &&
                    filteredTourImages.length > 0 ? (
                      filteredTourImages.map((image) => (
                        <TableRow
                          key={image.id}
                          className={
                            loadingFeaturedIds.includes(image.id)
                              ? "opacity-50 pointer-events-none transition-opacity duration-300"
                              : ""
                          }
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={image.image_url}
                                alt={getAltText(image)}
                                className="w-16 h-12 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
                                onError={handleImageError}
                                onClick={() => handleViewImage(image)}
                              />
                              <div className="flex items-center gap-1">
                                <ImageIcon className="w-4 h-4 text-blue-600" />
                                <span className="text-xs text-muted-foreground">
                                  ID: {image.id}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={image.tour.poster_url}
                                alt={image.tour.title}
                                className="w-12 h-8 object-cover rounded"
                                onError={handleImageError}
                              />
                              <div>
                                <p className="font-medium text-sm">
                                  {image.tour.title}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p
                              className="text-sm max-w-32 truncate"
                              title={getAltText(image)}
                            >
                              {getAltText(image)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                image.is_featured ? "default" : "secondary"
                              }
                            >
                              {image.is_featured ? "Nổi bật" : "Thường"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {image.tour.tour_category.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewImage(image)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {!isAdmin && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditImage(image)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleToggleFeatured(image.id)
                                    }
                                    title={
                                      image.is_featured
                                        ? "Bỏ nổi bật"
                                        : "Đánh dấu nổi bật"
                                    }
                                    disabled={loadingFeaturedIds.includes(
                                      image.id
                                    )}
                                  >
                                    {loadingFeaturedIds.includes(image.id) ? (
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : image.is_featured ? (
                                      <StarOff className="w-4 h-4" />
                                    ) : (
                                      <Star className="w-4 h-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteImage(image.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Xóa hình ảnh"
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
                          {loading
                            ? "Đang tải..."
                            : "Không có hình ảnh nào được tìm thấy."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}

              {/* Pagination */}
              {Array.isArray(filteredTourImages) && totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị{" "}
                    {Array.isArray(filteredTourImages)
                      ? filteredTourImages.length
                      : 0}{" "}
                    trong tổng số {totalItems} hình ảnh
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
      {mode === "view" && selectedImageId && (
        <TourImageViewContent
          imageId={selectedImageId}
          onBack={handleBack}
          showHeader={true}
          onEdit={(id) => {
            setSelectedImageId(id.toString());
            setMode("edit");
          }}
        />
      )}
      {mode === "edit" && selectedImageId && (
        <TourImageEditor mode="edit" id={selectedImageId} onBack={handleBack} />
      )}
      {mode === "create" && (
        <TourImageEditor mode="create" onBack={handleBack} />
      )}
    </div>
  );
};

export default TourImagesManagement;
