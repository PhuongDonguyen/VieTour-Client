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
import { providerTourService } from '../../services/provider/providerTour.service';
import { adminTourService } from '../../services/admin/adminTour.service';
import { fetchActiveTourCategories } from '../../services/tourCategory.service';
import type { ProviderTour } from '../../apis/provider/providerTour.api';
import type { AdminTour } from '../../apis/admin/adminTour.api';

const ProviderTours: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  
  const [tours, setTours] = useState<(ProviderTour | AdminTour)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedTour, setSelectedTour] = useState<ProviderTour | AdminTour | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Form states
  const [tourForm, setTourForm] = useState({
    title: '',
    image: null as File | null,
    capacity: '',
    transportation: '',
    accommodation: '',
    destination_intro: '',
    tour_info: '',
    duration: '',
    tour_category_id: '',
    live_commentary: '', // Tour diễn ra
    is_active: true
  });
  const [editingTourId, setEditingTourId] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tourCategories, setTourCategories] = useState<any[]>([]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTourForm({...tourForm, image: file});
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Generate slug from title
  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize('NFD') // Decompose accented characters
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[đĐ]/g, 'd') // Handle Vietnamese đ
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Clear form
  const clearForm = () => {
    setTourForm({
      title: '',
      image: null,
      capacity: '',
      transportation: '',
      accommodation: '',
      destination_intro: '',
      tour_info: '',
      duration: '',
      tour_category_id: '',
      live_commentary: '',
      is_active: true
    });
    // Cleanup preview URL to prevent memory leak
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setEditingTourId(null);
  };

  // Helper functions to normalize data between AdminTour and ProviderTour
  const getTourCapacity = (tour: ProviderTour | AdminTour): number => {
    return 'capacity' in tour ? tour.capacity : tour.max_participants;
  };

  const getTourRating = (tour: ProviderTour | AdminTour): number => {
    return 'total_star' in tour ? tour.total_star : tour.average_rating;
  };

  const getTourReviewCount = (tour: ProviderTour | AdminTour): number => {
    return 'review_count' in tour ? tour.review_count : tour.total_reviews;
  };

  const getTourBookedCount = (tour: ProviderTour | AdminTour): number => {
    return 'booked_count' in tour ? tour.booked_count : tour.booking_count;
  };

  const getTourViewCount = (tour: ProviderTour | AdminTour): string => {
    const viewCount = tour.view_count;
    return typeof viewCount === 'string' ? viewCount : viewCount.toString();
  };

  const getTourTransportation = (tour: ProviderTour | AdminTour): string => {
    return 'transportation' in tour ? tour.transportation : tour.location;
  };

  const getTourAccommodation = (tour: ProviderTour | AdminTour): string => {
    return 'accommodation' in tour ? tour.accommodation : 'Không có thông tin';
  };

  const getTourDestinationIntro = (tour: ProviderTour | AdminTour): string | null => {
    return 'destination_intro' in tour ? tour.destination_intro : null;
  };

  const getTourInfo = (tour: ProviderTour | AdminTour): string | null => {
    return 'tour_info' in tour ? tour.tour_info : null;
  };

  const getTourLiveCommentary = (tour: ProviderTour | AdminTour): string | null => {
    return 'live_commentary' in tour ? tour.live_commentary : null;
  };

  // Fetch tours data
  const fetchTours = async () => {
    try {
      setLoading(true);
      
      let response;
      if (isAdmin) {
        // Use admin service to get all tours from all providers
        response = await adminTourService.getAllTours({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined
        });
      } else {
        // Use provider service to get only provider's tours
        response = await providerTourService.getTours({
          page: currentPage,
          limit: 10,
          search: searchTerm || undefined
        });
      }
      
      console.log('Full response from service:', response); // Debug log
      
      // Handle different response formats
      let toursData: (ProviderTour | AdminTour)[] = [];
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

  // Fetch tour categories
  const fetchTourCategoriesData = async () => {
    try {
      const categories = await fetchActiveTourCategories();
      setTourCategories(categories);
    } catch (error) {
      console.error('Error fetching tour categories:', error);
      setTourCategories([]);
    }
  };

  useEffect(() => {
    fetchTours();
    fetchTourCategoriesData(); // Fetch categories on component mount
  }, [currentPage, searchTerm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle delete tour
  const handleDeleteTour = async (id: number) => {
    if (isAdmin) {
      alert('Admin không có quyền xóa tour.');
      return;
    }
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
    if (isAdmin) {
      alert('Admin không có quyền thay đổi trạng thái tour.');
      return;
    }
    try {
      await providerTourService.toggleTourStatus(id);
      fetchTours(); // Refresh list
    } catch (error) {
      console.error('Failed to toggle tour status:', error);
      alert('Không thể thay đổi trạng thái tour. Vui lòng thử lại.');
    }
  };

  // Handle view tour details
  const handleViewTour = (tour: ProviderTour | AdminTour) => {
    setSelectedTour(tour);
    setIsViewDialogOpen(true);
  };

  // Handle create tour
  const handleCreateTour = () => {
    if (isAdmin) {
      alert('Admin không có quyền tạo tour.');
      return;
    }
    // Reset form
    clearForm();
    setIsCreateDialogOpen(true);
  };

  // Handle edit tour
  const handleEditTour = (tour: ProviderTour | AdminTour) => {
    if (isAdmin) {
      alert('Admin không có quyền chỉnh sửa tour.');
      return;
    }
    
    // Populate form with tour data
    setTourForm({
      title: tour.title,
      image: null, // Will be set if user selects new image
      capacity: getTourCapacity(tour).toString(),
      transportation: getTourTransportation(tour),
      accommodation: getTourAccommodation(tour),
      destination_intro: getTourDestinationIntro(tour) || '',
      tour_info: getTourInfo(tour) || '',
      duration: tour.duration.toString(),
      tour_category_id: tour.tour_category.id.toString(),
      live_commentary: getTourLiveCommentary(tour) || '', // Load existing live_commentary
      is_active: tour.is_active
    });
    
    // Set current image as preview if exists
    if ('poster_url' in tour && tour.poster_url) {
      setImagePreview(tour.poster_url);
    }
    
    setEditingTourId(tour.id);
    setSelectedTour(tour);
    setIsEditDialogOpen(true);
  };

  // Handle save tour (create/update)
  const handleSaveTour = async () => {
    if (isAdmin) {
      alert('Admin không có quyền lưu tour.');
      return;
    }

    // Validation
    if (!tourForm.title || !tourForm.capacity || !tourForm.tour_category_id) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc (Tên tour, Sức chứa, Danh mục).');
      return;
    }

    // For create, image is required
    if (!editingTourId && !tourForm.image) {
      alert('Vui lòng chọn ảnh cho tour.');
      return;
    }

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('title', tourForm.title);
      formData.append('slug', generateSlug(tourForm.title)); // Generate slug from title
      formData.append('capacity', tourForm.capacity);
      formData.append('transportation', tourForm.transportation);
      formData.append('accommodation', tourForm.accommodation);
      formData.append('destination_intro', tourForm.destination_intro);
      formData.append('tour_info', tourForm.tour_info);
      formData.append('duration', tourForm.duration);
      formData.append('tour_category_id', tourForm.tour_category_id);
      formData.append('live_commentary', tourForm.live_commentary);
      formData.append('is_active', tourForm.is_active.toString());
      
      // Add provider_id from current user
      if (user?.id) {
        formData.append('provider_id', user.id.toString());
      }
      
      // Add image if selected
      if (tourForm.image) {
        formData.append('image', tourForm.image);
      }

      if (selectedTour && isEditDialogOpen) {
        // Update existing tour
        await providerTourService.updateTour(selectedTour.id, formData);
        setIsEditDialogOpen(false);
        alert('Cập nhật tour thành công!');
      } else {
        // Create new tour
        await providerTourService.createTour(formData);
        setIsCreateDialogOpen(false);
        alert('Tạo tour mới thành công!');
      }
      
      fetchTours(); // Refresh list
      setSelectedTour(null);
      clearForm();
      
    } catch (error) {
      console.error('Failed to save tour:', error);
      alert('Không thể lưu tour. Vui lòng thử lại.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Tours</h1>
          <p className="text-muted-foreground">
            Quản lý tất cả tours của bạn ({totalItems} tours)
            {isAdmin && <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>}
          </p>
          {/* Debug info */}
          <div className="text-xs text-gray-500 mt-2">
            Debug: tours.length = {tours.length}, loading = {loading.toString()}
          </div>
        </div>
        {!isAdmin && (
          <Button onClick={handleCreateTour}>
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
                <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
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
                        {getTourCapacity(tour)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {getTourRating(tour) > 0 ? `${getTourRating(tour)}/5` : "N/A"}
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
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewTour(tour)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
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
                          </>
                        )}
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
                      {getTourTransportation(selectedTour)}
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
                    <p className="text-2xl font-bold">{getTourCapacity(selectedTour)}</p>
                    <p className="text-sm text-muted-foreground">Sức chứa</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <p className="text-2xl font-bold">
                      {getTourRating(selectedTour) > 0 ? `${getTourRating(selectedTour)}/5` : "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Đánh giá ({getTourReviewCount(selectedTour)})
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Eye className="w-6 h-6 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">
                      {parseInt(getTourViewCount(selectedTour)).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Lượt xem</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-6 h-6 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">{getTourBookedCount(selectedTour)}</p>
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
                      <p className="text-muted-foreground">{getTourTransportation(selectedTour)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Lưu trú:</p>
                      <p className="text-muted-foreground">{getTourAccommodation(selectedTour)}</p>
                    </div>
                    <div>
                      <p className="font-medium">Thời gian:</p>
                      <p className="text-muted-foreground">{selectedTour.duration}</p>
                    </div>
                    <div>
                      <p className="font-medium">Sức chứa tối đa:</p>
                      <p className="text-muted-foreground">{getTourCapacity(selectedTour)} người</p>
                    </div>
                    {getTourLiveCommentary(selectedTour) && (
                      <div>
                        <p className="font-medium">Tour diễn ra:</p>
                        <p className="text-muted-foreground">{getTourLiveCommentary(selectedTour)}</p>
                      </div>
                    )}
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
                        {parseInt(getTourViewCount(selectedTour)).toLocaleString()} lượt
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Đánh giá trung bình:</p>
                      <p className="text-muted-foreground">
                        {getTourRating(selectedTour) > 0 
                          ? `${getTourRating(selectedTour)}/5 (${getTourReviewCount(selectedTour)} đánh giá)`
                          : "Chưa có đánh giá"
                        }
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Số lượng đã đặt:</p>
                      <p className="text-muted-foreground">{getTourBookedCount(selectedTour)} lượt đặt</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tour Description */}
              {getTourDestinationIntro(selectedTour) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Giới Thiệu Điểm Đến</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {getTourDestinationIntro(selectedTour)}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Tour Info */}
              {getTourInfo(selectedTour) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông Tin Tour</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {getTourInfo(selectedTour)}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Tour Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
        setIsCreateDialogOpen(open);
        if (!open) clearForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Tạo Tour Mới
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin để tạo tour mới
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tên Tour</label>
              <Input 
                placeholder="Nhập tên tour..."
                value={tourForm.title}
                onChange={(e) => setTourForm({...tourForm, title: e.target.value})}
              />
              {tourForm.title && (
                <div className="text-xs text-gray-500 mt-1">
                  Slug: <span className="font-mono">{generateSlug(tourForm.title)}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hình Ảnh Tour</label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sức Chứa</label>
                <Input 
                  type="number"
                  placeholder="50"
                  value={tourForm.capacity}
                  onChange={(e) => setTourForm({...tourForm, capacity: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thời Gian</label>
                <Input 
                  placeholder="3 ngày 2 đêm"
                  value={tourForm.duration}
                  onChange={(e) => setTourForm({...tourForm, duration: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vận Chuyển</label>
              <Input 
                placeholder="Xe khách, máy bay..."
                value={tourForm.transportation}
                onChange={(e) => setTourForm({...tourForm, transportation: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lưu Trú</label>
              <Input 
                placeholder="Khách sạn 3 sao..."
                value={tourForm.accommodation}
                onChange={(e) => setTourForm({...tourForm, accommodation: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Giới Thiệu Điểm Đến</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[80px]"
                placeholder="Mô tả về điểm đến..."
                value={tourForm.destination_intro}
                onChange={(e) => setTourForm({...tourForm, destination_intro: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Thông Tin Tour</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[80px]"
                placeholder="Thông tin chi tiết về tour..."
                value={tourForm.tour_info}
                onChange={(e) => setTourForm({...tourForm, tour_info: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Danh Mục Tour</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={tourForm.tour_category_id}
                onChange={(e) => setTourForm({...tourForm, tour_category_id: e.target.value})}
              >
                <option value="">Chọn danh mục...</option>
                {tourCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tour Diễn Ra</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[60px]"
                placeholder="VD: Thứ 2, Thứ 6 hàng tuần | Khởi hành 8:00 sáng..."
                value={tourForm.live_commentary}
                onChange={(e) => setTourForm({...tourForm, live_commentary: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="create_is_active" 
                checked={tourForm.is_active}
                onChange={(e) => setTourForm({...tourForm, is_active: e.target.checked})}
              />
              <label htmlFor="create_is_active" className="text-sm font-medium">
                Kích hoạt ngay
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleSaveTour}
                disabled={!tourForm.title || !tourForm.capacity || !tourForm.tour_category_id || (!tourForm.image && !editingTourId)}
              >
                Tạo Tour
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Tour Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) clearForm();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Chỉnh Sửa Tour
            </DialogTitle>
            <DialogDescription>
              Cập nhật thông tin tour
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tên Tour</label>
              <Input 
                placeholder="Nhập tên tour..."
                value={tourForm.title}
                onChange={(e) => setTourForm({...tourForm, title: e.target.value})}
              />
              {tourForm.title && (
                <div className="text-xs text-gray-500 mt-1">
                  Slug: <span className="font-mono">{generateSlug(tourForm.title)}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Hình Ảnh Tour</label>
              <input 
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full p-2 border rounded-md"
              />
              <div className="text-xs text-gray-500 mt-1">
                Để trống nếu không muốn thay đổi ảnh
              </div>
              {imagePreview && (
                <div className="mt-2">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sức Chứa</label>
                <Input 
                  type="number"
                  placeholder="50"
                  value={tourForm.capacity}
                  onChange={(e) => setTourForm({...tourForm, capacity: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Thời Gian</label>
                <Input 
                  placeholder="3 ngày 2 đêm"
                  value={tourForm.duration}
                  onChange={(e) => setTourForm({...tourForm, duration: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Vận Chuyển</label>
              <Input 
                placeholder="Xe khách, máy bay..."
                value={tourForm.transportation}
                onChange={(e) => setTourForm({...tourForm, transportation: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Lưu Trú</label>
              <Input 
                placeholder="Khách sạn 3 sao..."
                value={tourForm.accommodation}
                onChange={(e) => setTourForm({...tourForm, accommodation: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Giới Thiệu Điểm Đến</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[80px]"
                placeholder="Mô tả về điểm đến..."
                value={tourForm.destination_intro}
                onChange={(e) => setTourForm({...tourForm, destination_intro: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Thông Tin Tour</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[80px]"
                placeholder="Thông tin chi tiết về tour..."
                value={tourForm.tour_info}
                onChange={(e) => setTourForm({...tourForm, tour_info: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Danh Mục Tour</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={tourForm.tour_category_id}
                onChange={(e) => setTourForm({...tourForm, tour_category_id: e.target.value})}
              >
                <option value="">Chọn danh mục...</option>
                {tourCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tour Diễn Ra</label>
              <textarea 
                className="w-full p-2 border rounded-md min-h-[60px]"
                placeholder="VD: Thứ 2, Thứ 6 hàng tuần | Khởi hành 8:00 sáng..."
                value={tourForm.live_commentary}
                onChange={(e) => setTourForm({...tourForm, live_commentary: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="edit_is_active" 
                checked={tourForm.is_active}
                onChange={(e) => setTourForm({...tourForm, is_active: e.target.checked})}
              />
              <label htmlFor="edit_is_active" className="text-sm font-medium">
                Kích hoạt
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleSaveTour}
                disabled={!tourForm.title || !tourForm.capacity || !tourForm.tour_category_id}
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

export default ProviderTours;
