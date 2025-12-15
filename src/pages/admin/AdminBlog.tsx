import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { getAllCategories, type BlogCategory } from '@/services/blogCategory.service';
import { fetchBlogs, deleteBlog, type BlogPost } from '@/services/blog.service';
import { useAuth } from '@/hooks/useAuth';

const AdminBlog: React.FC = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryList = await getAllCategories();
                setCategories(categoryList);
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
            }
        };
        loadCategories();
    }, []);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Load blogs from API for current user
    useEffect(() => {
        const loadBlogs = async () => {
            if (!user?.account_id) return;

            try {
                setIsLoading(true);
                
                // Build API parameters
                const params: any = {
                    author_id: user.account_id,
                    page,
                    limit: 1
                };

                // Add category filter if not "all"
                if (selectedCategory !== 'all') {
                    params.category_id = parseInt(selectedCategory);
                }

                // Add status filter if not "all"
                if (selectedStatus !== 'all') {
                    params.status = selectedStatus as 'published' | 'draft' | 'archived';
                }

                // Add search filter if provided
                if (debouncedSearchTerm) {
                    params.search = debouncedSearchTerm;
                }

                const response = await fetchBlogs(params);

                // Extract data and pagination from response
                const blogsData = response.data || [];
                setBlogs(blogsData);
                setTotalPages(response.pagination?.totalPages || 1);
            } catch (error) {
                console.error('Lỗi khi tải bài viết:', error);
                setBlogs([]);
                setTotalPages(0);
            } finally {
                setIsLoading(false);
            }
        };

        loadBlogs();
    }, [page, selectedCategory, debouncedSearchTerm, user?.account_id, selectedStatus]);

    // Remove client-side filtering since we're now doing server-side filtering
    const filteredBlogs = blogs;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'default';
            case 'draft': return 'secondary';
            case 'archived': return 'destructive';
            default: return 'outline';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'published': return 'Đã xuất bản';
            case 'draft': return 'Bản nháp';
            case 'archived': return 'Đã lưu trữ';
            default: return status;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getCategoryName = (categoryId: number) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.title : 'Không xác định';
    };

    const handleDelete = async (blogId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            try {
                await deleteBlog(blogId);
                setBlogs(blogs.filter(blog => blog.id !== blogId));
            } catch (error) {
                console.error('Lỗi khi xóa bài viết:', error);
                alert('Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại.');
            }
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setPage(1); // Reset to first page when searching
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setPage(1); // Reset to first page when filtering
    };

    const handleStatusChange = (value: string) => {
        setSelectedStatus(value);
        setPage(1); // Reset to first page when filtering
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quản lý Blog</h1>
                    <p className="text-muted-foreground">Quản lý bài viết và bài báo của bạn</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* <Button
                        variant="outline"
                        onClick={() => navigate('/admin/blog-categories')}
                        className="flex items-center gap-2"
                    >
                        Quản lý Danh mục
                    </Button> */}
                    <Button onClick={() => navigate('/admin/blog/new')} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Bài viết mới
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tổng bài viết</p>
                                <p className="text-2xl font-bold">{blogs.length}</p>
                            </div>
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <Eye className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Đã xuất bản</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {blogs.filter(b => b.status === 'published').length}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Bản nháp</p>
                                <p className="text-2xl font-bold text-amber-600">
                                    {blogs.filter(b => b.status === 'draft').length}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                                <Edit className="h-4 w-4 text-amber-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Tháng này</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {blogs.filter(b =>
                                        new Date(b.created_at).getMonth() === new Date().getMonth()
                                    ).length}
                                </p>
                            </div>
                            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardHeader>
                    <CardTitle>Danh sách bài viết</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm bài viết..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                            <option value="all">Tất cả danh mục</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id.toString()}>
                                    {category.title}
                                </option>
                            ))}
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                            <option value="all">Tất cả trạng thái</option>
                            <option value="published">Đã xuất bản</option>
                            <option value="draft">Bản nháp</option>
                            <option value="archived">Đã lưu trữ</option>
                        </select>
                    </div>

                    {/* Blog Posts Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Tác giả</TableHead>
                                    <TableHead>Danh mục</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Ngày tạo</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredBlogs.map((blog) => (
                                    <TableRow key={blog.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                {blog.thumbnail && (
                                                    <img
                                                        src={blog.thumbnail}
                                                        alt={blog.title}
                                                        className="w-12 h-12 rounded-md object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium">{blog.title}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {blog.content.substring(0, 60)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{blog.author}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">
                                                {getCategoryName(blog.category_id)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusColor(blog.status)}>
                                                {getStatusText(blog.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{formatDate(blog.created_at)}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/admin/blog/edit/${blog.id}`)}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Xóa bài viết</DialogTitle>
                                                            <DialogDescription>
                                                                Bạn có chắc chắn muốn xóa "{blog.title}"? Hành động này không thể hoàn tác.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="flex justify-end gap-2">
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline">Hủy</Button>
                                                            </DialogTrigger>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => handleDelete(blog.id)}
                                                            >
                                                                Xóa
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-muted-foreground">
                                Hiển thị {filteredBlogs.length} trong tổng số {totalPages} trang
                            </div>
                            <div className="flex space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    disabled={page === 1}
                                >
                                    Trước
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={page === totalPages}
                                >
                                    Tiếp
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminBlog;
