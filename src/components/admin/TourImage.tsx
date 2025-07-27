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
} from "lucide-react";
import { providerTourImageService } from "../../services/provider/providerTourImage.service";
import { adminTourImageService } from "../../services/admin/adminTourImage.service";
import type { TourImage } from "../../apis/provider/providerTourImage.api";
import type { AdminTourImage } from "../../apis/admin/adminTourImage.api";
import { useNavigate } from "react-router-dom";
import TourImageViewModal from "./TourImageViewModal";

const TourImagesManagement: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  const [tourImages, setTourImages] = useState<(TourImage | AdminTourImage)[]>(
    []
  );
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
  const [selectedTourId, setSelectedTourId] = useState<string>("all");
  const [selectedFeatured, setSelectedFeatured] = useState<string>("all");
  const [availableTours, setAvailableTours] = useState<
    { id: number; title: string }[]
  >([]);

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

  // Fetch tour images data from API
  const fetchTourImages = async () => {
    try {
      setLoading(true);

      let response;
      if (isAdmin) {
        // Use admin service to get all tour images from all providers
        response = await adminTourImageService.getAllTourImages({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          tour_id:
            selectedTourId === "all" ? undefined : parseInt(selectedTourId),
          is_featured:
            selectedFeatured === "all"
              ? undefined
              : selectedFeatured === "true",
        });
      } else {
        // Use provider service to get only provider's tour images
        response = await providerTourImageService.getTourImages({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          tour_id:
            selectedTourId === "all" ? undefined : parseInt(selectedTourId),
          is_featured:
            selectedFeatured === "all"
              ? undefined
              : selectedFeatured === "true",
        });
      }

      console.log("API response:", response);

      const imagesData = response.data || [];
      const paginationData = response.pagination || {
        totalPages: 1,
        totalItems: 0,
      };

      // Sort by tour title, then by image ID
      const sortedImagesData = imagesData.sort(
        (a: TourImage | AdminTourImage, b: TourImage | AdminTourImage) => {
          const tourCompare = a.tour.title.localeCompare(b.tour.title, "vi", {
            sensitivity: "base",
          });
          return tourCompare !== 0 ? tourCompare : a.id - b.id;
        }
      );

      // Extract unique tours for dropdown
      const uniqueTours = imagesData.reduce(
        (
          acc: { id: number; title: string }[],
          image: TourImage | AdminTourImage
        ) => {
          if (!acc.find((tour) => tour.id === image.tour.id)) {
            acc.push({ id: image.tour.id, title: image.tour.title });
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

      setTourImages(sortedImagesData);
      setAvailableTours(sortedTours);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch tour images:", error);
      setTourImages([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourImages();
  }, [currentPage, searchTerm, selectedTourId, selectedFeatured]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view image
  const handleViewImage = (image: TourImage | AdminTourImage) => {
    setViewImageId(image.id.toString());
    setIsViewDialogOpen(true);
  };

  const handleCreateImage = () => {
    navigate("/admin/tours/images/new");
  };

  const handleEditImage = (image: TourImage | AdminTourImage) => {
    navigate(`/admin/tours/images/edit/${image.id}`);
  };

  // Handle toggle featured
  const handleToggleFeatured = async (id: number) => {
    if (isAdmin) {
      alert("Admin không có quyền thay đổi trạng thái.");
      return;
    }
    try {
      await providerTourImageService.toggleFeatured(id);
      fetchTourImages();
    } catch (error) {
      console.error("Failed to toggle featured status:", error);
      alert("Không thể thay đổi trạng thái nổi bật. Vui lòng thử lại.");
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
        fetchTourImages();
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Hình Ảnh Tours</h1>
          <p className="text-muted-foreground">
            Quản lý thư viện hình ảnh và ảnh nổi bật của các tours ({totalItems}{" "}
            hình ảnh)
            {isAdmin && (
              <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>
            )}
          </p>
        </div>
        {!isAdmin && (
          <Button
            onClick={handleCreateImage}
            className="bg-purple-600 hover:bg-purple-700"
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
            <div className="w-40">
              <Select
                value={selectedFeatured}
                onValueChange={setSelectedFeatured}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Nổi bật" />
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
              {Array.isArray(tourImages) && tourImages.length > 0 ? (
                tourImages.map((image) => (
                  <TableRow key={image.id}>
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
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={image.is_featured ? "default" : "secondary"}
                        >
                          {image.is_featured ? (
                            <>
                              <Star className="w-3 h-3 mr-1" />
                              Nổi bật
                            </>
                          ) : (
                            "Thường"
                          )}
                        </Badge>
                      </div>
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
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!isAdmin && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleFeatured(image.id)}
                              title={
                                image.is_featured ? "Bỏ nổi bật" : "Đặt nổi bật"
                              }
                              className={
                                image.is_featured
                                  ? "text-orange-600 hover:text-orange-800"
                                  : "text-blue-600 hover:text-blue-800"
                              }
                            >
                              {image.is_featured ? (
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

          {/* Pagination */}
          {Array.isArray(tourImages) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tourImages) ? tourImages.length : 0}{" "}
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

      {/* Modal for viewing image details */}
      <TourImageViewModal
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        imageId={viewImageId || ""}
      />
    </div>
  );
};

export default TourImagesManagement;
