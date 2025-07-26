import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DollarSign
} from 'lucide-react';
import { providerTourPriceService } from '../../services/providerTourPrice.service';
import type { TourPrice } from '../../apis/providerTourPrice.api';

const TourPricesManagement: React.FC = () => {
  const [tourPrices, setTourPrices] = useState<TourPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedPrice, setSelectedPrice] = useState<TourPrice | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<TourPrice | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<string>('all');
  const [availableTours, setAvailableTours] = useState<{ id: number; title: string }[]>([]);

  // Fetch tour prices data from API
  const fetchTourPrices = async () => {
    try {
      setLoading(true);
      
      const response = await providerTourPriceService.getTourPrices({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        tour_id: selectedTourId === 'all' ? undefined : parseInt(selectedTourId)
      });
      
      console.log('API response:', response);
      
      const pricesData = response.data || [];
      const paginationData = response.pagination || { totalPages: 1, totalItems: 0 };
      
      // Sort by tour title
      const sortedPricesData = pricesData.sort((a: TourPrice, b: TourPrice) => 
        a.tour.title.localeCompare(b.tour.title, 'vi', { sensitivity: 'base' })
      );
      
      // Extract unique tours for dropdown
      const uniqueTours = pricesData.reduce((acc: { id: number; title: string }[], price: TourPrice) => {
        if (!acc.find(tour => tour.id === price.tour.id)) {
          acc.push({ id: price.tour.id, title: price.tour.title });
        }
        return acc;
      }, []);
      
      // Sort available tours by title
      const sortedTours = uniqueTours.sort((a: { id: number; title: string }, b: { id: number; title: string }) => 
        a.title.localeCompare(b.title, 'vi', { sensitivity: 'base' })
      );
      
      setTourPrices(sortedPricesData);
      setAvailableTours(sortedTours);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      
    } catch (error) {
      console.error('Failed to fetch tour prices:', error);
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
  const handleViewPrice = (price: TourPrice) => {
    setSelectedPrice(price);
    setIsViewDialogOpen(true);
  };

  // Handle edit price
  const handleEditPrice = (price: TourPrice) => {
    setEditingPrice({ ...price });
    setIsEditDialogOpen(true);
  };

  // Handle delete price
  const handleDeletePrice = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giá tour này?')) {
      try {
        await providerTourPriceService.deleteTourPrice(id);
        fetchTourPrices();
      } catch (error) {
        console.error('Failed to delete tour price:', error);
        alert('Không thể xóa giá tour. Vui lòng thử lại.');
      }
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Giá Tours</h1>
          <p className="text-muted-foreground">
            Quản lý bảng giá cho các tours ({totalItems} bảng giá)
          </p>
        </div>
        <Button 
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm Giá Tour
        </Button>
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
                <TableHead>Ghi Chú</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead>Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(tourPrices) && tourPrices.length > 0 ? (
                tourPrices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={price.tour.poster_url}
                          alt={price.tour.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">{price.tour.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(price.adult_price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(price.kid_price)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{price.note}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{price.tour.tour_category.name}</Badge>
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
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {loading ? "Đang tải..." : "Không có bảng giá nào được tìm thấy."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {Array.isArray(tourPrices) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tourPrices) ? tourPrices.length : 0} trong tổng số {totalItems} bảng giá
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

      {/* View Price Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Chi Tiết Bảng Giá Tour
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết bảng giá của tour được chọn
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrice && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex gap-4">
                <img
                  src={selectedPrice.tour.poster_url}
                  alt={selectedPrice.tour.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{selectedPrice.tour.title}</h3>
                  <Badge variant="secondary" className="mb-2">{selectedPrice.tour.tour_category.name}</Badge>
                  <p className="text-sm text-muted-foreground">ID: {selectedPrice.id}</p>
                </div>
              </div>

              {/* Price Details */}
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-600">Giá Người Lớn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(selectedPrice.adult_price)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-600">Giá Trẻ Em</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(selectedPrice.kid_price)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Note */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Ghi Chú</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{selectedPrice.note}</p>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Tour Price Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm Bảng Giá Tour Mới
            </DialogTitle>
            <DialogDescription>
              Tạo bảng giá mới cho tour
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Cơ Bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Chọn Tour</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tour..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTours.map((tour) => (
                        <SelectItem key={tour.id} value={tour.id.toString()}>
                          {tour.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Giá Người Lớn (VND)</label>
                    <Input 
                      type="number"
                      placeholder="20000000"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Giá Trẻ Em (VND)</label>
                    <Input 
                      type="number"
                      placeholder="15000000"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Ghi Chú</label>
                  <Input 
                    placeholder="Nhập ghi chú..."
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                disabled
              >
                Lưu Bảng Giá
              </Button>
            </div>

            {/* Footer Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                📝 <strong>Lưu ý:</strong> Form tạo mới đã được thiết kế. Tính năng lưu sẽ được kích hoạt sau.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourPricesManagement;
