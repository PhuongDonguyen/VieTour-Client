import React, { useState, useEffect, useContext } from "react";
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
  Trash2,
  Eye,
  Plus,
  ImageIcon,
  Star,
  StarOff,
  Edit,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import {
  fetchAllTourImages,
  deleteTourImageService,
  toggleTourImageFeaturedService,
} from "@/services/tourImage.service";
import { useNavigate, useSearchParams } from "react-router-dom";
import TourImageViewContent from "./TourImageViewContent";
import TourImageEditor from "./TourImageEditor";

const TourImagesManagement: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";
  const [searchParams] = useSearchParams();

  // Get tour_id from URL query parameter
  const tourIdFromUrl = searchParams.get("tour_id");

  const [tourImages, setTourImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedFeatured, setSelectedFeatured] = useState<string>("all");
  const [mode, setMode] = useState<"list" | "view" | "edit" | "create">("list");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [loadingFeaturedIds, setLoadingFeaturedIds] = useState<number[]>([]);

  const navigate = useNavigate();

  // Fetch tour images data
  const fetchTourImages = async () => {
    setLoading(true);
    try {
      const res = await fetchAllTourImages({
        page: currentPage,
        tour_id: tourIdFromUrl ? Number(tourIdFromUrl) : undefined,
        is_featured:
          selectedFeatured !== "all" ? selectedFeatured === "true" : undefined,
      });
      setTourImages(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotalItems(res.pagination.totalItems);
    } catch (error) {
      console.error("Error fetching tour images:", error);
      setTourImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourImages();
  }, [currentPage, selectedFeatured]);

  // Handle view image
  const handleViewImage = (image: any) => {
    setSelectedImageId(image.id.toString());
    setMode("view");
  };

  const handleEditImage = (image: any) => {
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
      await toggleTourImageFeaturedService(id);
      setTourImages((prevImages) =>
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
        await deleteTourImageService(id);
        setTourImages((prevImages) =>
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
    <div className="space-y- p-6">
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

          {/* Filter by status only */}
          <Card className="my-6">
            <CardHeader>
              <CardTitle>Bộ Lọc Trạng Thái</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end">
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
                      <TableHead className="w-1/3">Hình Ảnh</TableHead>
                      <TableHead className="w-1/3">Mô Tả</TableHead>
                      <TableHead className="w-1/6">Trạng Thái</TableHead>
                      <TableHead className="w-1/6">
                        {isAdmin ? "Xem" : "Thao Tác"}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(tourImages) && tourImages.length > 0 ? (
                      tourImages.map((image) => (
                        <TableRow
                          key={image.id}
                          className={
                            loadingFeaturedIds.includes(image.id)
                              ? "opacity-50 pointer-events-none transition-opacity duration-300"
                              : ""
                          }
                        >
                          <TableCell className="w-1/3">
                            <div className="flex items-center gap-3">
                              <img
                                src={image.image_url}
                                alt={image.alt_text || "Tour image"}
                                className="w-20 h-16 object-cover rounded border cursor-pointer hover:opacity-80 transition-opacity"
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
                          <TableCell className="w-1/3">
                            <p
                              className="text-sm max-w-48 truncate"
                              title={image.alt_text || "Tour image"}
                            >
                              {image.alt_text || "Tour image"}
                            </p>
                          </TableCell>
                          <TableCell className="w-1/6">
                            <Badge
                              variant={
                                image.is_featured ? "default" : "secondary"
                              }
                            >
                              {image.is_featured ? "Nổi bật" : "Thường"}
                            </Badge>
                          </TableCell>
                          <TableCell className="w-1/6">
                            <div className="flex gap-1">
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
                        <TableCell colSpan={4} className="text-center py-8">
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
