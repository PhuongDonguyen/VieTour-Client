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
  Trash2, 
  Eye,
  Plus,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Clock
} from 'lucide-react';
import { providerTourPriceOverrideService } from '../../services/provider/providerTourPriceOverride.service';
import { adminTourPriceOverrideService } from '../../services/admin/adminTourPriceOverride.service';
import type { TourPriceOverride } from '../../apis/provider/providerTourPriceOverride.api';
import type { AdminTourPriceOverride } from '../../apis/admin/adminTourPriceOverride.api';

const TourPriceOverridesManagement: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  
  const [priceOverrides, setPriceOverrides] = useState<(TourPriceOverride | AdminTourPriceOverride)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedOverride, setSelectedOverride] = useState<TourPriceOverride | AdminTourPriceOverride | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOverrideType, setSelectedOverrideType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [availableTours, setAvailableTours] = useState<{ id: number; title: string }[]>([]);
  const [availableTourPrices, setAvailableTourPrices] = useState<{ id: number; tour_title: string; adult_price: number }[]>([]);
  
  // Create form states
  const [createForm, setCreateForm] = useState({
    tour_price_id: '',
    override_type: '',
    override_date: '',
    start_date: '',
    end_date: '',
    day_of_week: '',
    adult_price: '',
    kid_price: '',
    note: '',
    is_active: true
  });

  // Fetch price overrides data from API
  const fetchPriceOverrides = async () => {
    try {
      setLoading(true);
      
      let response;
      if (isAdmin) {
        // Admin uses admin service
        response = await adminTourPriceOverrideService.getAllTourPriceOverrides({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          override_type: selectedOverrideType === 'all' ? undefined : selectedOverrideType as any,
          is_active: selectedStatus === 'all' ? undefined : selectedStatus === 'true'
        });
      } else {
        // Provider uses provider service
        response = await providerTourPriceOverrideService.getTourPriceOverrides({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined,
          override_type: selectedOverrideType === 'all' ? undefined : selectedOverrideType,
          is_active: selectedStatus === 'all' ? undefined : selectedStatus === 'true'
        });
      }
      
      console.log('API response:', response);
      
      const overridesData = response.data || [];
      const paginationData = response.pagination || { totalPages: 1, totalItems: 0 };
      
      // Sort by tour title, then by override date
      const sortedOverridesData = overridesData.sort((a: TourPriceOverride | AdminTourPriceOverride, b: TourPriceOverride | AdminTourPriceOverride) => {
        const tourCompare = a.tour_price.tour.title.localeCompare(b.tour_price.tour.title, 'vi', { sensitivity: 'base' });
        if (tourCompare !== 0) return tourCompare;
        
        // Compare dates (handle nulls)
        const aDate = a.override_date || a.start_date || '9999-12-31';
        const bDate = b.override_date || b.start_date || '9999-12-31';
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });
      
      // Extract unique tours for dropdown
      const uniqueTours = overridesData.reduce((acc: { id: number; title: string }[], override: TourPriceOverride | AdminTourPriceOverride) => {
        if (!acc.find(tour => tour.id === override.tour_price.tour.id)) {
          acc.push({ id: override.tour_price.tour.id, title: override.tour_price.tour.title });
        }
        return acc;
      }, []);
      
      // Sort available tours by title
      const sortedTours = uniqueTours.sort((a: { id: number; title: string }, b: { id: number; title: string }) => 
        a.title.localeCompare(b.title, 'vi', { sensitivity: 'base' })
      );
      
      setPriceOverrides(sortedOverridesData);
      setAvailableTours(sortedTours);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      
    } catch (error) {
      console.error('Failed to fetch price overrides:', error);
      setPriceOverrides([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceOverrides();
  }, [currentPage, searchTerm, selectedOverrideType, selectedStatus]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view override
  const handleViewOverride = (override: TourPriceOverride | AdminTourPriceOverride) => {
    setSelectedOverride(override);
    setIsViewDialogOpen(true);
  };

  // Handle toggle active
  const handleToggleActive = async (id: number) => {
    if (isAdmin) {
      alert('Admin không có quyền thay đổi trạng thái.');
      return;
    }
    try {
      await providerTourPriceOverrideService.toggleActive(id);
      fetchPriceOverrides();
    } catch (error) {
      console.error('Failed to toggle active status:', error);
      alert('Không thể thay đổi trạng thái. Vui lòng thử lại.');
    }
  };

  // Handle delete override
  const handleDeleteOverride = async (id: number) => {
    if (isAdmin) {
      alert('Admin không có quyền xóa.');
      return;
    }
    if (window.confirm('Bạn có chắc chắn muốn xóa ghi đè giá này?')) {
      try {
        await providerTourPriceOverrideService.deleteTourPriceOverride(id);
        fetchPriceOverrides();
      } catch (error) {
        console.error('Failed to delete price override:', error);
        alert('Không thể xóa ghi đè giá. Vui lòng thử lại.');
      }
    }
  };

  // Handle create override
  const handleCreateOverride = async () => {
    if (isAdmin) {
      alert('Admin không có quyền tạo mới.');
      return;
    }

    try {
      const data = {
        tour_price_id: parseInt(createForm.tour_price_id),
        override_type: createForm.override_type as 'single_date' | 'date_range' | 'day_of_week',
        override_date: createForm.override_type === 'single_date' ? createForm.override_date : undefined,
        start_date: createForm.override_type === 'date_range' ? createForm.start_date : undefined,
        end_date: createForm.override_type === 'date_range' ? createForm.end_date : undefined,
        day_of_week: createForm.override_type === 'day_of_week' ? createForm.day_of_week : undefined,
        adult_price: parseFloat(createForm.adult_price),
        kid_price: parseFloat(createForm.kid_price),
        note: createForm.note || '',
        is_active: createForm.is_active
      };

      await providerTourPriceOverrideService.createTourPriceOverride(data);
      setIsCreateDialogOpen(false);
      fetchPriceOverrides();
      
      // Reset form
      setCreateForm({
        tour_price_id: '',
        override_type: '',
        override_date: '',
        start_date: '',
        end_date: '',
        day_of_week: '',
        adult_price: '',
        kid_price: '',
        note: '',
        is_active: true
      });
      
      alert('Tạo ghi đè giá thành công!');
    } catch (error) {
      console.error('Failed to create price override:', error);
      alert('Không thể tạo ghi đè giá. Vui lòng thử lại.');
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get override type text
  const getOverrideTypeText = (type: string) => {
    switch (type) {
      case 'single_date':
        return 'Ngày cụ thể';
      case 'date_range':
        return 'Khoảng thời gian';
      case 'day_of_week':
        return 'Theo thứ';
      default:
        return type;
    }
  };

  // Get override type variant
  const getOverrideTypeVariant = (type: string) => {
    switch (type) {
      case 'single_date':
        return 'default';
      case 'date_range':
        return 'secondary';
      case 'day_of_week':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get date display for override
  const getDateDisplay = (override: TourPriceOverride | AdminTourPriceOverride) => {
    if (override.override_type === 'single_date' && override.override_date) {
      return formatDate(override.override_date);
    }
    if (override.override_type === 'date_range' && override.start_date && override.end_date) {
      return `${formatDate(override.start_date)} - ${formatDate(override.end_date)}`;
    }
    if (override.override_type === 'day_of_week' && override.day_of_week) {
      return `Thứ ${override.day_of_week}`;
    }
    return 'Chưa xác định';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {isAdmin ? 'Quản Lý Price Overrides (Admin)' : 'Quản Lý Ghi Đè Giá Tours'}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? `Xem tất cả price overrides trong hệ thống (${totalItems} quy tắc) - Chỉ xem`
              : `Quản lý các quy tắc ghi đè giá theo ngày và thời gian (${totalItems} quy tắc)`
            }
          </p>
        </div>
        {!isAdmin && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Ghi Đè Giá
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
                placeholder="Tìm kiếm theo tên tour hoặc ghi chú..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
            <div className="w-48">
              <Select value={selectedOverrideType} onValueChange={setSelectedOverrideType}>
                <SelectTrigger>
                  <SelectValue placeholder="Loại ghi đè" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="single_date">Ngày cụ thể</SelectItem>
                  <SelectItem value="date_range">Khoảng thời gian</SelectItem>
                  <SelectItem value="day_of_week">Theo thứ</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour</TableHead>
                <TableHead>Thời Gian Áp Dụng</TableHead>
                <TableHead>Loại Ghi Đè</TableHead>
                <TableHead>Giá Người Lớn</TableHead>
                <TableHead>Giá Trẻ Em</TableHead>
                <TableHead>Trạng Thái</TableHead>
                <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(priceOverrides) && priceOverrides.length > 0 ? (
                priceOverrides.map((override) => (
                  <TableRow key={override.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={override.tour_price.tour.poster_url}
                          alt={override.tour_price.tour.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">{override.tour_price.tour.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Giá gốc: {formatCurrency(override.tour_price.adult_price)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-medium text-sm">{getDateDisplay(override)}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getOverrideTypeVariant(override.override_type)}>
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
                        <Badge variant={override.is_active ? 'default' : 'secondary'}>
                          {override.is_active ? 'Kích hoạt' : 'Tạm ngưng'}
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
                              onClick={() => handleToggleActive(override.id)}
                              title={override.is_active ? "Tạm ngưng" : "Kích hoạt"}
                              className={override.is_active ? "text-orange-600 hover:text-orange-800" : "text-green-600 hover:text-green-800"}
                            >
                              {override.is_active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteOverride(override.id)}
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
                  <TableCell colSpan={7} className="text-center py-8">
                    {loading ? "Đang tải..." : "Không có quy tắc ghi đè giá nào được tìm thấy."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {Array.isArray(priceOverrides) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(priceOverrides) ? priceOverrides.length : 0} trong tổng số {totalItems} quy tắc
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

      {/* View Override Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Chi Tiết Ghi Đè Giá Tour
            </DialogTitle>
            <DialogDescription>
              Xem thông tin chi tiết quy tắc ghi đè giá được chọn
            </DialogDescription>
          </DialogHeader>
          
          {selectedOverride && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex gap-4">
                <img
                  src={selectedOverride.tour_price.tour.poster_url}
                  alt={selectedOverride.tour_price.tour.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{selectedOverride.tour_price.tour.title}</h3>
                  <Badge variant="outline" className="mb-2">{selectedOverride.tour_price.tour.tour_category.name}</Badge>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <p>ID ghi đè: {selectedOverride.id}</p>
                    <Badge variant={selectedOverride.is_active ? 'default' : 'secondary'}>
                      {selectedOverride.is_active ? 'Kích hoạt' : 'Tạm ngưng'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Price Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-gray-600">Giá Gốc</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Người lớn:</span>
                      <span className="font-semibold">{formatCurrency(selectedOverride.tour_price.adult_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trẻ em:</span>
                      <span className="font-semibold">{formatCurrency(selectedOverride.tour_price.kid_price)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-green-600">Giá Ghi Đè</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Người lớn:</span>
                      <span className="font-bold text-green-700">{formatCurrency(selectedOverride.adult_price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trẻ em:</span>
                      <span className="font-bold text-blue-700">{formatCurrency(selectedOverride.kid_price)}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Override Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Thông Tin Ghi Đè
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Loại ghi đè</label>
                      <Badge variant={getOverrideTypeVariant(selectedOverride.override_type)}>
                        {getOverrideTypeText(selectedOverride.override_type)}
                      </Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Thời gian áp dụng</label>
                      <p className="text-sm text-muted-foreground">{getDateDisplay(selectedOverride)}</p>
                    </div>
                  </div>
                  
                  {selectedOverride.note && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Ghi chú</label>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {selectedOverride.note}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-1">Ghi chú giá gốc</label>
                    <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded">
                      {selectedOverride.tour_price.note}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Price Override Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm Ghi Đè Giá Mới
            </DialogTitle>
            <DialogDescription>
              Tạo quy tắc ghi đè giá mới cho tour
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
                  <Select value={createForm.tour_price_id} onValueChange={(value) => setCreateForm({...createForm, tour_price_id: value})}>
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
                
                <div>
                  <label className="block text-sm font-medium mb-2">Loại Ghi Đè</label>
                  <Select value={createForm.override_type} onValueChange={(value) => setCreateForm({...createForm, override_type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại ghi đè..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single_date">Ngày cụ thể</SelectItem>
                      <SelectItem value="date_range">Khoảng thời gian</SelectItem>
                      <SelectItem value="day_of_week">Theo thứ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date inputs based on override type */}
                {createForm.override_type === 'single_date' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Ngày áp dụng</label>
                    <Input 
                      type="date"
                      value={createForm.override_date}
                      onChange={(e) => setCreateForm({...createForm, override_date: e.target.value})}
                      className="w-full"
                    />
                  </div>
                )}

                {createForm.override_type === 'date_range' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ngày bắt đầu</label>
                      <Input 
                        type="date"
                        value={createForm.start_date}
                        onChange={(e) => setCreateForm({...createForm, start_date: e.target.value})}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Ngày kết thúc</label>
                      <Input 
                        type="date"
                        value={createForm.end_date}
                        onChange={(e) => setCreateForm({...createForm, end_date: e.target.value})}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {createForm.override_type === 'day_of_week' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Thứ trong tuần</label>
                    <Select value={createForm.day_of_week} onValueChange={(value) => setCreateForm({...createForm, day_of_week: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn thứ..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">Thứ 2</SelectItem>
                        <SelectItem value="3">Thứ 3</SelectItem>
                        <SelectItem value="4">Thứ 4</SelectItem>
                        <SelectItem value="5">Thứ 5</SelectItem>
                        <SelectItem value="6">Thứ 6</SelectItem>
                        <SelectItem value="7">Thứ 7</SelectItem>
                        <SelectItem value="8">Chủ Nhật</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Giá Người Lớn (VND)</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      min="0"
                      value={createForm.adult_price}
                      onChange={(e) => setCreateForm({...createForm, adult_price: e.target.value})}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Giá Trẻ Em (VND)</label>
                    <Input 
                      type="number"
                      placeholder="0"
                      min="0"
                      value={createForm.kid_price}
                      onChange={(e) => setCreateForm({...createForm, kid_price: e.target.value})}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Ghi Chú</label>
                  <Input 
                    placeholder="Nhập ghi chú cho quy tắc ghi đè..."
                    value={createForm.note}
                    onChange={(e) => setCreateForm({...createForm, note: e.target.value})}
                    className="w-full"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="is_active" 
                    className="rounded" 
                    checked={createForm.is_active}
                    onChange={(e) => setCreateForm({...createForm, is_active: e.target.checked})}
                  />
                  <label htmlFor="is_active" className="text-sm font-medium">
                    Kích hoạt ngay
                  </label>
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
                onClick={handleCreateOverride}
                disabled={!createForm.tour_price_id || !createForm.override_type || !createForm.adult_price || !createForm.kid_price}
              >
                Lưu Ghi Đè Giá
              </Button>
            </div>

            {/* Footer Note */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                💰 <strong>Lưu ý:</strong> Điền đầy đủ thông tin để tạo quy tắc ghi đè giá mới.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourPriceOverridesManagement;
