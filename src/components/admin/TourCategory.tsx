import React, { useState, useEffect, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthContext } from '@/context/authContext';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Plus,
  FolderOpen,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { adminTourCategoryService } from '../../services/admin/adminTourCategory.service';
import type { AdminTourCategory } from '../../apis/admin/adminTourCategory.api';

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
  const isAdmin = user?.role === 'admin';
  
  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mt-2">Chỉ admin mới có thể truy cập trang này.</p>
        </div>
      </div>
    );
  }

  const [tourCategories, setTourCategories] = useState<AdminTourCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<AdminTourCategory | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<CreateTourCategoryRequest>({
    name: '',
    description: '',
    image_url: '',
    is_active: true
  });
  const [editFormData, setEditFormData] = useState<UpdateTourCategoryRequest>({
    name: '',
    description: '',
    image_url: '',
    is_active: true
  });

  // Fetch tour categories data from API
  const fetchTourCategories = async () => {
    try {
      setLoading(true);
      
      const response = await adminTourCategoryService.getAllTourCategories({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      });
      
      console.log('API response:', response);
      
      const categoriesData = response.data || [];
      const paginationData = response.pagination || { totalPages: 1, totalItems: 0 };
      
      // Sort by name
      const sortedCategoriesData = categoriesData.sort((a: AdminTourCategory, b: AdminTourCategory) => 
        a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
      );
      
      setTourCategories(sortedCategoriesData);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      
    } catch (error) {
      console.error('Failed to fetch tour categories:', error);
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

  // Handle view category
  const handleViewCategory = (category: AdminTourCategory) => {
    setSelectedCategory(category);
    setIsViewDialogOpen(true);
  };

  // Handle edit category
  const handleEditCategory = (category: AdminTourCategory) => {
    setSelectedCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || '',
      image_url: category.image_url,
      is_active: category.is_active
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete category
  const handleDeleteCategory = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Thao tác này không thể hoàn tác.')) {
      try {
        await adminTourCategoryService.deleteTourCategory(id);
        fetchTourCategories();
        alert('Xóa danh mục thành công!');
      } catch (error) {
        console.error('Failed to delete tour category:', error);
        alert('Không thể xóa danh mục. Vui lòng thử lại.');
      }
    }
  };

  // Handle toggle active status
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const category = tourCategories.find(cat => cat.id === id);
      if (!category) return;

      await adminTourCategoryService.updateTourCategory(id, {
        name: category.name,
        image_url: category.image_url,
        is_active: !currentStatus
      });
      fetchTourCategories();
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      alert('Không thể thay đổi trạng thái. Vui lòng thử lại.');
    }
  };

  // Handle create category
  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên danh mục.');
      return;
    }

    try {
      await adminTourCategoryService.createTourCategory(formData);
      fetchTourCategories();
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', image_url: '', is_active: true });
      alert('Tạo danh mục thành công!');
    } catch (error) {
      console.error('Failed to create tour category:', error);
      alert('Không thể tạo danh mục. Vui lòng thử lại.');
    }
  };

  // Handle update category
  const handleUpdateCategory = async () => {
    if (!editFormData.name?.trim()) {
      alert('Vui lòng nhập tên danh mục.');
      return;
    }

    if (!selectedCategory) return;

    try {
      await adminTourCategoryService.updateTourCategory(selectedCategory.id, editFormData);
      fetchTourCategories();
      setIsEditDialogOpen(false);
      alert('Cập nhật danh mục thành công!');
    } catch (error) {
      console.error('Failed to update tour category:', error);
      alert('Không thể cập nhật danh mục. Vui lòng thử lại.');
    }
  };

  // Handle image error
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = '/placeholder-tour.jpg';
  };

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
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
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
                          <p className="text-sm text-muted-foreground">ID: {category.id}</p>
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
                      <div className="flex items-center gap-2">
                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                          {category.is_active ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(category.id, category.is_active)}
                        >
                          {category.is_active ? 
                            <ToggleRight className="w-4 h-4 text-green-600" /> : 
                            <ToggleLeft className="w-4 h-4 text-gray-600" />
                          }
                        </Button>
                      </div>
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
                    {loading ? "Đang tải..." : "Không có danh mục nào được tìm thấy."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {Array.isArray(tourCategories) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tourCategories) ? tourCategories.length : 0} trong tổng số {totalItems} danh mục
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Category Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Chi Tiết Danh Mục Tour
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết danh mục tour được chọn
            </DialogDescription>
          </DialogHeader>
          
          {selectedCategory && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex gap-4">
                <img
                  src={selectedCategory.image_url}
                  alt={selectedCategory.name}
                  className="w-24 h-16 object-cover rounded-lg border"
                  onError={handleImageError}
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{selectedCategory.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedCategory.id}</p>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-600">Số Lượng Tours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{selectedCategory.tourCount} tours</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-600">Trạng Thái</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={selectedCategory.is_active ? 'default' : 'secondary'} className="text-sm">
                      {selectedCategory.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </CardContent>
                </Card>
              </div>

              {/* Image URL */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">URL Hình Ảnh</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded break-all">
                    {selectedCategory.image_url}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm Danh Mục Tour Mới
            </DialogTitle>
            <DialogDescription>
              Tạo danh mục mới cho tours
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Danh Mục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Danh Mục *</label>
                  <Input 
                    placeholder="Nhập tên danh mục..."
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mô tả</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mô tả danh mục..."
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">URL Hình Ảnh</label>
                  <Input 
                    placeholder="https://example.com/image.jpg"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                  {formData.image_url && (
                    <div className="mt-2">
                      <img
                        src={formData.image_url}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded border"
                        onError={handleImageError}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="create-active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="create-active" className="text-sm font-medium">Kích hoạt ngay</label>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setFormData({ name: '', description: '', image_url: '', is_active: true });
                }}
              >
                Hủy
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleCreateCategory}
              >
                Tạo Danh Mục
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Chỉnh Sửa Danh Mục Tour
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin danh mục tour
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Danh Mục</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên Danh Mục *</label>
                  <Input 
                    placeholder="Nhập tên danh mục..."
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Mô tả</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập mô tả danh mục..."
                    value={editFormData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">URL Hình Ảnh</label>
                  <Input 
                    placeholder="https://example.com/image.jpg"
                    value={editFormData.image_url}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, image_url: e.target.value }))}
                  />
                  {editFormData.image_url && (
                    <div className="mt-2">
                      <img
                        src={editFormData.image_url}
                        alt="Preview"
                        className="w-32 h-20 object-cover rounded border"
                        onError={handleImageError}
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="edit-active"
                    checked={editFormData.is_active}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="edit-active" className="text-sm font-medium">Kích hoạt</label>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleUpdateCategory}
              >
                Cập Nhật
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourCategoriesManagement;
