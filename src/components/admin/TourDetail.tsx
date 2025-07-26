import React, { useState, useEffect, useContext } from 'react';
import './TipTapEditor.css';
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
  Clock,
  Plus
} from 'lucide-react';
import { providerTourDetailService } from '../../services/provider/providerTourDetail.service';
import type { TourDetail } from '../../apis/provider/providerTourDetail.api';
import { AuthContext } from '../../context/authContext';

// Rich Text Editor Component
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TextAlign } from '@tiptap/extension-text-align';
import { FontFamily } from '@tiptap/extension-font-family';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ content, onChange, placeholder }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      FontFamily,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 p-3 border-b bg-gray-50">
        {/* Text Formatting */}
        <Button
          variant={editor.isActive('bold') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>B</strong>
        </Button>
        <Button
          variant={editor.isActive('italic') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </Button>
        <Button
          variant={editor.isActive('underline') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>U</u>
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Alignment */}
        <Button
          variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          ⇤
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          ≡
        </Button>
        <Button
          variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          ⇥
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Lists */}
        <Button
          variant={editor.isActive('bulletList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          • List
        </Button>
        <Button
          variant={editor.isActive('orderedList') ? 'default' : 'outline'}
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1. List
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Color */}
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="w-8 h-8 border rounded cursor-pointer"
          title="Text Color"
        />

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Size - using headings as proxy */}
        <select
          onChange={(e) => {
            const level = parseInt(e.target.value);
            if (level === 0) {
              editor.chain().focus().setParagraph().run();
            } else {
              editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 }).run();
            }
          }}
          className="px-2 py-1 border rounded text-sm"
        >
          <option value="0">Normal</option>
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="3">Heading 3</option>
        </select>
      </div>

      {/* Editor */}
      <div className="min-h-[200px] p-3">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none focus:outline-none"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

const TourDetails: React.FC = () => {
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === 'admin';
  
  const [tourDetails, setTourDetails] = useState<TourDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedDetail, setSelectedDetail] = useState<TourDetail | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDetail, setEditingDetail] = useState<TourDetail | null>(null);
  const [selectedTourId, setSelectedTourId] = useState<string>('all');
  const [availableTours, setAvailableTours] = useState<{ id: number; title: string }[]>([]);

  // Fetch tour details data
  const fetchTourDetails = async () => {
    try {
      setLoading(true);
      const response = await providerTourDetailService.getTourDetails({
        page: currentPage,
        limit: 10,
        search: searchTerm || undefined,
        tour_id: selectedTourId === 'all' ? undefined : parseInt(selectedTourId)
      });
      
      console.log('Full response from service:', response);
      
      // The service now returns the properly structured response
      const detailsData = response.data || [];
      const paginationData = response.pagination || { totalPages: 1, totalItems: 0 };
      
      console.log('Processed tour details data:', detailsData);
      console.log('Pagination data:', paginationData);
      
      // Sort by tour title
      const sortedDetailsData = detailsData.sort((a, b) => 
        a.tour.title.localeCompare(b.tour.title, 'vi', { sensitivity: 'base' })
      );
      
      // Extract unique tours for dropdown
      const uniqueTours = detailsData.reduce((acc: { id: number; title: string }[], detail) => {
        if (!acc.find(tour => tour.id === detail.tour.id)) {
          acc.push({ id: detail.tour.id, title: detail.tour.title });
        }
        return acc;
      }, []);
      
      // Sort available tours by title
      const sortedTours = uniqueTours.sort((a, b) => 
        a.title.localeCompare(b.title, 'vi', { sensitivity: 'base' })
      );
      
      setTourDetails(sortedDetailsData);
      setAvailableTours(sortedTours);
      setTotalPages(paginationData.totalPages || 1);
      setTotalItems(paginationData.totalItems || 0);
      
    } catch (error) {
      console.error('Failed to fetch tour details:', error);
      setTourDetails([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTourDetails();
  }, [currentPage, searchTerm, selectedTourId]);

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle view detail
  const handleViewDetail = (detail: TourDetail) => {
    setSelectedDetail(detail);
    setIsViewDialogOpen(true);
  };

  // Handle edit detail
  const handleEditDetail = (detail: TourDetail) => {
    setEditingDetail({ ...detail });
    setIsEditDialogOpen(true);
  };

  // Handle delete detail
  const handleDeleteDetail = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa chi tiết tour này?')) {
      try {
        await providerTourDetailService.deleteTourDetail(id);
        fetchTourDetails();
      } catch (error) {
        console.error('Failed to delete tour detail:', error);
        alert('Không thể xóa chi tiết tour. Vui lòng thử lại.');
      }
    }
  };

  // Handle content changes in editor
  const handleContentChange = (field: 'morning_description' | 'noon_description' | 'afternoon_description', content: string) => {
    if (editingDetail) {
      setEditingDetail({
        ...editingDetail,
        [field]: content
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản Lý Chi Tiết Tours</h1>
          <p className="text-muted-foreground">
            Quản lý lịch trình chi tiết của các tours ({totalItems} chi tiết)
            {isAdmin && <span className="text-orange-600 ml-2">(Chỉ xem - Admin)</span>}
          </p>
        </div>
        {!isAdmin && (
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm Chi Tiết Tour
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
                placeholder="Tìm kiếm theo tên tour hoặc tiêu đề..."
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

      {/* Tour Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh Sách Chi Tiết Tours</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tour</TableHead>
                <TableHead>Tiêu Đề</TableHead>
                <TableHead>Thứ Tự</TableHead>
                <TableHead>Danh Mục</TableHead>
                <TableHead>{isAdmin ? "Xem" : "Thao Tác"}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(tourDetails) && tourDetails.length > 0 ? (
                tourDetails.map((detail) => (
                  <TableRow key={detail.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={detail.tour.poster_url}
                          alt={detail.tour.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div>
                          <p className="font-medium text-sm">{detail.tour.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{detail.title}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">Ngày {detail.order}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{detail.tour.tour_category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetail(detail)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {!isAdmin && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditDetail(detail)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteDetail(detail.id)}
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
                  <TableCell colSpan={5} className="text-center py-8">
                    {loading ? "Đang tải..." : "Không có chi tiết tour nào được tìm thấy."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {Array.isArray(tourDetails) && totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Hiển thị {Array.isArray(tourDetails) ? tourDetails.length : 0} trong tổng số {totalItems} chi tiết
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

      {/* View Detail Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Chi Tiết Lịch Trình Tour
            </DialogTitle>
            <DialogDescription>
              Xem chi tiết lịch trình của tour được chọn
            </DialogDescription>
          </DialogHeader>
          
          {selectedDetail && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex gap-4">
                <img
                  src={selectedDetail.tour.poster_url}
                  alt={selectedDetail.tour.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{selectedDetail.title}</h3>
                  <p className="text-lg text-muted-foreground mb-2">{selectedDetail.tour.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">Ngày {selectedDetail.order}</Badge>
                    <Badge variant="secondary">{selectedDetail.tour.tour_category.name}</Badge>
                  </div>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5" />
                      Buổi Sáng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedDetail.morning_description }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5" />
                      Buổi Trưa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedDetail.noon_description }}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5" />
                      Buổi Chiều
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedDetail.afternoon_description }}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Detail Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="w-5 h-5" />
              Chỉnh Sửa Chi Tiết Tour
            </DialogTitle>
            <DialogDescription>
              Chỉnh sửa lịch trình chi tiết của tour (chưa cho phép lưu)
            </DialogDescription>
          </DialogHeader>
          
          {editingDetail && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex gap-4">
                <img
                  src={editingDetail.tour.poster_url}
                  alt={editingDetail.tour.title}
                  className="w-24 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{editingDetail.title}</h3>
                  <p className="text-lg text-muted-foreground mb-2">{editingDetail.tour.title}</p>
                  <Badge variant="outline">Ngày {editingDetail.order}</Badge>
                </div>
              </div>

              {/* Edit Forms */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5" />
                      Buổi Sáng
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      content={editingDetail.morning_description}
                      onChange={(content) => handleContentChange('morning_description', content)}
                      placeholder="Nhập nội dung cho buổi sáng..."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5" />
                      Buổi Trưa
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      content={editingDetail.noon_description}
                      onChange={(content) => handleContentChange('noon_description', content)}
                      placeholder="Nhập nội dung cho buổi trưa..."
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="w-5 h-5" />
                      Buổi Chiều
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      content={editingDetail.afternoon_description}
                      onChange={(content) => handleContentChange('afternoon_description', content)}
                      placeholder="Nhập nội dung cho buổi chiều..."
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Footer Note */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  📝 <strong>Lưu ý:</strong> Tính năng lưu chưa được kích hoạt. Bạn có thể chỉnh sửa nội dung để xem trước giao diện.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Tour Detail Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Thêm Chi Tiết Tour Mới
            </DialogTitle>
            <DialogDescription>
              Tạo chi tiết lịch trình mới cho tour
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Thông Tin Cơ Bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div>
                    <label className="block text-sm font-medium mb-2">Tiêu Đề Chi Tiết</label>
                    <Input 
                      placeholder="Nhập tiêu đề..."
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Thứ Tự (Ngày)</label>
                    <Input 
                      type="number"
                      placeholder="1"
                      min="1"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Schedule Details */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5" />
                    Buổi Sáng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    content=""
                    onChange={() => {}}
                    placeholder="Nhập nội dung cho buổi sáng..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5" />
                    Buổi Trưa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    content=""
                    onChange={() => {}}
                    placeholder="Nhập nội dung cho buổi trưa..."
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5" />
                    Buổi Chiều
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    content=""
                    onChange={() => {}}
                    placeholder="Nhập nội dung cho buổi chiều..."
                  />
                </CardContent>
              </Card>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700"
                disabled
              >
                Lưu Chi Tiết Tour
              </Button>
            </div>

            {/* Footer Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📝 <strong>Lưu ý:</strong> Form tạo mới đã được thiết kế. Tính năng lưu sẽ được kích hoạt sau.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TourDetails;
