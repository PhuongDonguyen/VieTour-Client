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
  Calendar,
  Users
} from 'lucide-react';
import { providerTourScheduleService } from '../../services/provider/providerTourSchedule.service';
import { adminTourScheduleService } from '../../services/admin/adminTourSchedule.service';
import type { TourSchedule } from '../../apis/provider/providerTourSchedule.api';
import type { AdminTourSchedule } from '../../apis/admin/adminTourSchedule.api';

const TourSchedulesManagement: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  
  const [tourSchedules, setTourSchedules] = useState<(TourSchedule | AdminTourSchedule)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedSchedule, setSelectedSchedule] = useState<TourSchedule | AdminTourSchedule | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTourId, setSelectedTourId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [availableTours, setAvailableTours] = useState<{ id: number; title: string }[]>([]);

  // Helper functions to normalize data between TourSchedule and AdminTourSchedule
  const getTourInfo = (schedule: TourSchedule | AdminTourSchedule) => {
    // Both TourSchedule and AdminTourSchedule have tour property with same structure
    return {
      id: schedule.tour.id,
      title: schedule.tour.title,
      poster_url: schedule.tour.poster_url,
      category_name: schedule.tour.tour_category.name
    };
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'active': 'Hoạt động',
      'inactive': 'Tạm dừng',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  // Fetch tour schedules data from API
  const fetchTourSchedules = async () => {
    try {
      setLoading(true);
      
      let response;
      if (isAdmin) {
        // Use admin service to get all tour schedules from all providers
        response = await adminTourScheduleService.getAllTourSchedules({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          tour_id: selectedTourId === 'all' ? undefined : parseInt(selectedTourId),
          status: selectedStatus === 'all' ? undefined : selectedStatus as "cancelled" | "available" | "full"
        });
      } else {
        // Use provider service to get only provider's tour schedules
        response = await providerTourScheduleService.getTourSchedules({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          tour_id: selectedTourId === 'all' ? undefined : parseInt(selectedTourId),
          status: selectedStatus === 'all' ? undefined : selectedStatus as "cancelled" | "available" | "full"
        });
      }
      
      console.log('API response:', response);
      
      const schedulesData = response.data || [];
      const paginationData = response.pagination || { totalPages: 1, totalItems: 0 };
      
      // Sort by start date
      const sortedSchedulesData = schedulesData.sort((a: TourSchedule | AdminTourSchedule, b: TourSchedule | AdminTourSchedule) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      );
      
      // Extract unique tours for dropdown
      const uniqueTours = schedulesData.reduce((acc: { id: number; title: string }[], schedule: TourSchedule | AdminTourSchedule) => {
        if (!acc.find(tour => tour.id === schedule.tour.id)) {
          acc.push({ id: schedule.tour.id, title: schedule.tour.title });
        }
        return acc;
      }, []);
      
      // Sort available tours by title
      const sortedTours = uniqueTours.sort((a: { id: number; title: string }, b: { id: number; title: string }) => 
        a.title.localeCompare(b.title, 'vi', { sensitivity: 'base' })
      );
      
      setTourSchedules(sortedSchedulesData);
      setAvailableTours(sortedTours);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      
    } catch (error) {
      console.error('Failed to fetch tour schedules:', error);
      setTourSchedules([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourSchedules();
  }, [currentPage, searchTerm, selectedTourId, selectedStatus]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view schedule
  const handleViewSchedule = (schedule: TourSchedule | AdminTourSchedule) => {
    setSelectedSchedule(schedule);
    setIsViewDialogOpen(true);
  };

  // Handle edit schedule  
  const handleEditSchedule = (schedule: TourSchedule | AdminTourSchedule) => {
    if (isAdmin) {
      alert('Admin không có quyền chỉnh sửa.');
      return;
    }
    // Tạm thời show view dialog thay vì edit
    setSelectedSchedule(schedule);
    setIsViewDialogOpen(true);
  };

  // Handle delete schedule
  const handleDeleteSchedule = async (id: number) => {
    if (isAdmin) {
      alert('Admin không có quyền xóa.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa lịch trình tour này?')) {
      try {
        await providerTourScheduleService.deleteTourSchedule(id);
        fetchTourSchedules();
      } catch (error) {
        console.error('Failed to delete tour schedule:', error);
        alert('Không thể xóa lịch trình tour. Vui lòng thử lại.');
      }
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'full':
        return 'destructive';
      case 'cancelled':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Còn chỗ';
      case 'full':
        return 'Hết chỗ';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Lịch Trình Tours</h1>
          <p className="text-muted-foreground">
            Quản lý lịch trình và thời gian biểu của các tours ({totalItems} lịch trình)
            {isAdmin && <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>}
          </p>
        </div>
        {!isAdmin && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Lịch Trình
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="available">Còn chỗ</SelectItem>
                  <SelectItem value="full">Hết chỗ</SelectItem>
                  <SelectItem value="cancelled">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tour Schedules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Lịch Trình Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour</TableHead>
                <TableHead>Ngày Khởi Hành</TableHead>
                <TableHead>Số Người Tham Gia</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(tourSchedules) && tourSchedules.length > 0 ? (
                tourSchedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={schedule.tour.poster_url}
                          alt={schedule.tour.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">{schedule.tour.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium">{formatDate(schedule.start_date)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="font-semibold">{schedule.participant} người</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(schedule.status)}>
                        {getStatusText(schedule.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{schedule.tour.tour_category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewSchedule(schedule)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!isAdmin && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule.id)}
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
                  <TableCell colSpan={6} className="text-center py-8">
                    {loading ? "Đang tải..." : "Không có lịch trình nào được tìm thấy."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {Array.isArray(tourSchedules) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tourSchedules) ? tourSchedules.length : 0} trong tổng số {totalItems} lịch trình
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

      {/* View Schedule Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Chi Tiết Lịch Trình Tour
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết lịch trình của tour được chọn
            </DialogDescription>
          </DialogHeader>
          
          {selectedSchedule && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex gap-4">
                <img
                  src={selectedSchedule.tour.poster_url}
                  alt={selectedSchedule.tour.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{selectedSchedule.tour.title}</h3>
                  <Badge variant="secondary" className="mb-2">{selectedSchedule.tour.tour_category.name}</Badge>
                  <p className="text-sm text-muted-foreground">ID: {selectedSchedule.id}</p>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-600 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Ngày Khởi Hành
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">{formatDate(selectedSchedule.start_date)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-600 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Số Người Tham Gia
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-lg font-bold">{selectedSchedule.participant} người</p>
                  </CardContent>
                </Card>
              </div>

              {/* Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Trạng Thái</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant={getStatusVariant(selectedSchedule.status)} className="text-sm">
                    {getStatusText(selectedSchedule.status)}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Tour Schedule Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm Lịch Trình Tour Mới
            </DialogTitle>
            <DialogDescription>
              Tạo lịch trình mới cho tour
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
                    <label className="block text-sm font-medium mb-2">Ngày Khởi Hành</label>
                    <Input 
                      type="date"
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Số Người Tham Gia</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      min="0"
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Trạng Thái</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Còn chỗ</SelectItem>
                      <SelectItem value="full">Hết chỗ</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
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
                className="bg-purple-600 hover:bg-purple-700"
                disabled
              >
                Lưu Lịch Trình
              </Button>
            </div>

            {/* Footer Note */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                📅 <strong>Lưu ý:</strong> Form tạo mới đã được thiết kế. Tính năng lưu sẽ được kích hoạt sau.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourSchedulesManagement;
