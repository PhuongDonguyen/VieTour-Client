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
  Search,
  Edit,
  Trash2,
  Eye,
  Plus,
  FolderOpen,
  ToggleLeft,
  ToggleRight,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  fetchTourCategoryById,
  createTourCategoryService,
  updateTourCategoryService,
  deleteTourCategoryService,
  fetchAllTourCategories,
} from "../../../services/tourCategory.service";
import type { AdminTourCategory } from "../../../apis/admin/adminTourCategory.api";
import TourCategoryEditor from "./TourCategoryEditor";
import TourCategoryViewContent from "./TourCategoryViewContent";

// Define request interfaces based on API
interface CreateTourCategoryRequest {
  name: string;
  description?: string;
  image_url: string;
  is_active?: boolean;
}

interface UpdateTourCategoryRequest {
  name?: string;
  description?: string;
  image_url?: string;
  is_active?: boolean;
}

const TourCategoriesManagement: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "admin";

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">
            Truy cập bị từ chối
          </h2>
          <p className="text-gray-600 mt-2">
            Chỉ admin mới có thể truy cập trang này.
          </p>
        </div>
      </div>
    );
  }

  const [tourCategories, setTourCategories] = useState<AdminTourCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  // 1. State quản lý chế độ hiển thị
  const [mode, setMode] = useState<"list" | "view" | "edit" | "create">("list");
  const [selectedCategory, setSelectedCategory] =
    useState<AdminTourCategory | null>(null);
  const [loadingActiveIds, setLoadingActiveIds] = useState<number[]>([]);
  const [viewLoading, setViewLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState<CreateTourCategoryRequest>({
    name: "",
    description: "",
    image_url: "",
    is_active: true,
  });
  const [editFormData, setEditFormData] = useState<UpdateTourCategoryRequest>({
    name: "",
    description: "",
    image_url: "",
    is_active: true,
  });

  // Fetch tour categories data from API
  const fetchTourCategories = async () => {
    try {
      setLoading(true);

      const response = await fetchAllTourCategories({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
      });

      console.log("API response:", response);

      const categoriesData = response.data || [];
      const paginationData = response.pagination || {
        totalPages: 1,
        totalItems: 0,
      };

      // Sort by name
      const sortedCategoriesData = categoriesData.sort(
        (a: AdminTourCategory, b: AdminTourCategory) =>
          a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
      );

      setTourCategories(sortedCategoriesData);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch tour categories:", error);
      setTourCategories([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourCategories();
  }, [currentPage, searchTerm]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 2. Handler chuyển chế độ
  const handleViewCategory = (category: AdminTourCategory) => {
    setViewLoading(true);
    setSelectedCategory(category);
    setMode("view");
    // Simulate loading time for better UX
    setTimeout(() => {
      setViewLoading(false);
    }, 800);
  };
  const handleEditCategory = (category: AdminTourCategory) => {
    setSelectedCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || "",
      image_url: category.image_url,
      is_active: category.is_active,
    });
    setMode("edit");
  };
  const handleCreateCategoryClick = () => {
    setFormData({ name: "", description: "", image_url: "", is_active: true });
    setMode("create");
  };
  const handleBackToList = () => {
    setMode("list");
    setSelectedCategory(null);
  };

  // Handle delete category
  const handleDeleteCategory = async (id: number) => {
    if (
      window.confirm(
        "Bạn có chắc chắn muốn xóa danh mục này? Thao tác này không thể hoàn tác."
      )
    ) {
      try {
        await deleteTourCategoryService(id);
        fetchTourCategories();
        alert("Xóa danh mục thành công!");
      } catch (error) {
        console.error("Failed to delete tour category:", error);
        alert("Không thể xóa danh mục. Vui lòng thử lại.");
      }
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    setLoadingActiveIds((prev) => [...prev, id]);
    try {
      const category = tourCategories.find((cat) => cat.id === id);
      if (!category) return;
      await updateTourCategoryService(id, {
        name: category.name,
        image_url: category.image_url,
        is_active: !currentStatus,
      });
      // Cập nhật local state thay vì reload toàn bộ list
      setTourCategories((prevCategories) =>
        prevCategories.map((cat) =>
          cat.id === id ? { ...cat, is_active: !currentStatus } : cat
        )
      );
    } catch (error) {
      console.error("Failed to toggle category status:", error);
      alert("Không thể thay đổi trạng thái. Vui lòng thử lại.");
    } finally {
      setLoadingActiveIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Handle create category
  const handleCreateCategory = async (data?: FormData) => {
    if (data instanceof FormData) {
      // Tạo mới với upload ảnh
      try {
        await createTourCategoryService(data);
        fetchTourCategories();
        setMode("list");
        alert("Tạo danh mục thành công!");
      } catch (error) {
        console.error("Failed to create tour category with image:", error);
        alert("Không thể tạo danh mục. Vui lòng thử lại.");
      }
      return;
    }
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên danh mục.");
      return;
    }
    try {
      await createTourCategoryService(formData);
      fetchTourCategories();
      setMode("list");
      setFormData({
        name: "",
        description: "",
        image_url: "",
        is_active: true,
      });
      alert("Tạo danh mục thành công!");
    } catch (error) {
      console.error("Failed to create tour category:", error);
      alert("Không thể tạo danh mục. Vui lòng thử lại.");
    }
  };

  // Handle update category
  const handleUpdateCategory = async (data?: FormData) => {
    if (!selectedCategory) return;
    if (data instanceof FormData) {
      // Cập nhật với upload ảnh
      try {
        const updated = await updateTourCategoryService(
          selectedCategory.id,
          data
        );
        fetchTourCategories();
        setSelectedCategory(updated); // cập nhật lại state với dữ liệu mới
        setMode("view"); // chuyển về view để preview đúng
        alert("Cập nhật danh mục thành công!");
      } catch (error) {
        console.error("Failed to update tour category with image:", error);
        alert("Không thể cập nhật danh mục. Vui lòng thử lại.");
      }
      return;
    }
    if (!editFormData.name?.trim()) {
      alert("Vui lòng nhập tên danh mục.");
      return;
    }
    try {
      const updated = await updateTourCategoryService(
        selectedCategory.id,
        editFormData
      );
      fetchTourCategories();
      setSelectedCategory(updated);
      setMode("view");
      alert("Cập nhật danh mục thành công!");
    } catch (error) {
      console.error("Failed to update tour category:", error);
      alert("Không thể cập nhật danh mục. Vui lòng thử lại.");
    }
  };

  // Handle image error
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    const target = e.target as HTMLImageElement;
    target.src = "/placeholder-tour.jpg";
  };

  // 3. Render UI theo mode
  if (mode === "view" && selectedCategory) {
    if (viewLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                Đang tải...
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Vui lòng chờ trong khi chúng tôi tải thông tin chi tiết danh mục
                tour.
              </p>
            </div>
          </div>
        </div>
      );
    }
    return (
      <TourCategoryViewContent
        category={selectedCategory}
        onBack={handleBackToList}
        onEdit={(cat) => handleEditCategory(cat)}
        showHeader
      />
    );
  }
  if (mode === "edit" && selectedCategory) {
    return (
      <TourCategoryEditor
        mode="edit"
        category={selectedCategory}
        onSave={async (data) => {
          await handleUpdateCategory(data);
        }}
        onCancel={handleBackToList}
      />
    );
  }
  if (mode === "create") {
    return (
      <TourCategoryEditor
        mode="create"
        onSave={async (data) => {
          await handleCreateCategory(data);
        }}
        onCancel={handleBackToList}
      />
    );
  }

  // 4. Giao diện list giữ nguyên, sửa nút Thêm Danh Mục và các nút Eye/Edit để chuyển mode
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Danh Mục Tours</h1>
          <p className="text-muted-foreground">
            Quản lý các danh mục tour du lịch ({totalItems} danh mục)
          </p>
        </div>
        <Button
          onClick={handleCreateCategoryClick}
          className="bg-black hover:bg-gray-800 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Danh Mục
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Tìm Kiếm</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên danh mục..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour Categories Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Danh Mục Tours</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
              <span className="text-muted-foreground text-lg">
                Đang tải danh sách danh mục...
              </span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Danh Mục</TableHead>
                  <TableHead>Hình Ảnh</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Số Tours</TableHead>
                  <TableHead>Trạng Thái</TableHead>
                  <TableHead>Thao Tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(tourCategories) && tourCategories.length > 0 ? (
                  tourCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <FolderOpen className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ID: {category.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={category.image_url}
                            alt={category.name}
                            className="w-16 h-12 object-cover rounded border"
                            onError={handleImageError}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {category.slug}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline">
                            {category.tourCount} tours
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={category.is_active ? "default" : "secondary"}
                        >
                          {category.is_active ? "Hoạt động" : "Tạm dừng"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCategory(category)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditCategory(category)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleToggleActive(
                                category.id,
                                category.is_active
                              )
                            }
                            title={
                              category.is_active ? "Tạm dừng" : "Kích hoạt"
                            }
                            disabled={loadingActiveIds.includes(category.id)}
                          >
                            {loadingActiveIds.includes(category.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : category.is_active ? (
                              <ToggleRight className="w-4 h-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="w-4 h-4 text-gray-600" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Không có danh mục nào được tìm thấy.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {Array.isArray(tourCategories) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị{" "}
                {Array.isArray(tourCategories) ? tourCategories.length : 0}{" "}
                trong tổng số {totalItems} danh mục
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

export default TourCategoriesManagement;
