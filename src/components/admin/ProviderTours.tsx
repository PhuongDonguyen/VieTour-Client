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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Clock
} from 'lucide-react';
import { providerTourService } from '../../services/providerTour.service';
import type { ProviderTour } from '../../apis/providerTour.api';

const ProviderTours: React.FC = () => {
  const [tours, setTours] = useState<ProviderTour[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTour, setSelectedTour] = useState<ProviderTour | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch tours data
  const fetchTours = async () => {
    try {
      setLoading(true);
      const response = await providerTourService.getTours({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined
      });
      
      console.log('Full response from service:', response); // Debug log
      
      // Handle different response formats
      let toursData: ProviderTour[] = [];
      let paginationData = { totalPages: 1, totalItems: 0 };
      
      if (response && typeof response === 'object') {
        // If response has a 'data' property (typical API format)
        if (response.data && Array.isArray(response.data)) {
          toursData = response.data;
          paginationData = response.pagination || { totalPages: 1, totalItems: response.data.length };
        }
        // If response is directly an array
        else if (Array.isArray(response)) {
          toursData = response;
          paginationData = { totalPages: 1, totalItems: response.length };
        }
        // If response has success property (from your JSON)
        else if ('success' in response && 'data' in response && Array.isArray(response.data)) {
          toursData = response.data;
          paginationData = response.pagination || { totalPages: 1, totalItems: response.data.length };
        }
      }
      
      console.log('Processed tours data:', toursData); // Debug log
      console.log('Pagination data:', paginationData); // Debug log
      
      setTours(toursData);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      
    } catch (error) {
      console.error('Failed to fetch tours:', error);
      setTours([]); // Ensure tours is always an array
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [currentPage, searchTerm]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle delete tour
  const handleDeleteTour = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tour này?')) {
      try {
        await providerTourService.deleteTour(id);
        fetchTours(); // Refresh list
      } catch (error) {
        console.error('Failed to delete tour:', error);
        alert('Không thể xóa tour. Vui lòng thử lại.');
      }
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: number) => {
    try {
      await providerTourService.toggleTourStatus(id);
      fetchTours(); // Refresh list
    } catch (error) {
      console.error('Failed to toggle tour status:', error);
      alert('Không thể thay đổi trạng thái tour. Vui lòng thử lại.');
    }
  };

  // Handle view tour details
  const handleViewTour = (tour: ProviderTour) => {
    setSelectedTour(tour);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Tours</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả tours của bạn ({totalItems} tours)
          </p>
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-2">
            Debug: tours.length = {tours.length}, loading = {loading.toString()}
          </div>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Thêm Tour Mới
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
                placeholder="Tìm kiếm theo tên tour..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tours Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hình Ảnh</TableHead>
                <TableHead>Tên Tour</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Số Lượng</TableHead>
                <TableHead>Đánh Giá</TableHead>
                <TableHead>Lượt Xem</TableHead>
                <TableHead>Đã Đặt</TableHead>
                <TableHead>Thao Tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(tours) && tours.length > 0 ? (
                tours.map((tour) => (
                    <TableRow key={tour.id}>
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
                          <p className="text-sm text-muted-foreground">{tour.duration}</p>
                        </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tour.tour_category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={tour.is_active ? "default" : "secondary"}
                        className={tour.is_active ? "bg-green-500" : "bg-red-500"}
                      >
                        {tour.is_active ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {tour.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {tour.total_star > 0 ? `${tour.total_star}/5` : "N/A"}
                        <span className="text-sm text-muted-foreground">
                          ({tour.review_count})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        {parseInt(tour.view_count).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        {tour.booked_count}
                      </div>
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {/* Handle edit */}}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggleStatus(tour.id)}
                        >
                          {tour.is_active ? "Tạm dừng" : "Kích hoạt"}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTour(tour.id)}
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
                    <TableCell colSpan={9} className="text-center py-8">
                      {loading ? "Đang tải..." : "Không có tours nào được tìm thấy."}
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {Array.isArray(tours) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tours) ? tours.length : 0} trong tổng số {totalItems} tours
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

      {/* Tour Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Thông Tin Chi Tiết Tour
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết về tour được chọn
            </DialogDescription>
          </DialogHeader>
          
          {selectedTour && (
            <div className="space-y-6">
              {/* Tour Header */}
              <div className="flex gap-4">
                <img
                  src={selectedTour.poster_url}
                  alt={selectedTour.title}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{selectedTour.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedTour.transportation}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedTour.duration}
                    </div>
                    <Badge 
                      variant={selectedTour.is_active ? "default" : "secondary"}
                      className={selectedTour.is_active ? "bg-green-500" : "bg-red-500"}
                    >
                      {selectedTour.is_active ? "Hoạt động" : "Tạm dừng"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Tour Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Users className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">{selectedTour.capacity}</p>
                    <p className="text-sm text-muted-foreground">Sức chứa</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">
                      {selectedTour.total_star > 0 ? `${selectedTour.total_star}/5` : "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Đánh giá ({selectedTour.review_count})
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Eye className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">
                      {parseInt(selectedTour.view_count).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Lượt xem</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{selectedTour.booked_count}</p>
                    <p className="text-sm text-muted-foreground">Đã đặt</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tour Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông Tin Cơ Bản</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">Danh mục:</p>
                      <Badge variant="secondary">{selectedTour.tour_category.name}</Badge>
                    </div>
                    <div>
                      <p className="font-medium">Vận chuyển:</p>
                      <p className="text-muted-foreground">{selectedTour.transportation}</p>
                    </div>
                    <div>
                      <p className="font-medium">Lưu trú:</p>
                      <p className="text-muted-foreground">{selectedTour.accommodation}</p>
                    </div>
                    <div>
                      <p className="font-medium">Thời gian:</p>
                      <p className="text-muted-foreground">{selectedTour.duration}</p>
                    </div>
                    <div>
                      <p className="font-medium">Sức chứa tối đa:</p>
                      <p className="text-muted-foreground">{selectedTour.capacity} người</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thống Kê</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-medium">Trạng thái:</p>
                      <Badge 
                        variant={selectedTour.is_active ? "default" : "secondary"}
                        className={selectedTour.is_active ? "bg-green-500" : "bg-red-500"}
                      >
                        {selectedTour.is_active ? "Hoạt động" : "Tạm dừng"}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium">Tổng lượt xem:</p>
                      <p className="text-muted-foreground">
                        {parseInt(selectedTour.view_count).toLocaleString()} lượt
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Đánh giá trung bình:</p>
                      <p className="text-muted-foreground">
                        {selectedTour.total_star > 0 
                          ? `${selectedTour.total_star}/5 (${selectedTour.review_count} đánh giá)`
                          : "Chưa có đánh giá"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Số lượng đã đặt:</p>
                      <p className="text-muted-foreground">{selectedTour.booked_count} lượt đặt</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tour Description */}
              {selectedTour.destination_intro && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Giới Thiệu Điểm Đến</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedTour.destination_intro}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Tour Info */}
              {selectedTour.tour_info && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông Tin Tour</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedTour.tour_info}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProviderTours;
