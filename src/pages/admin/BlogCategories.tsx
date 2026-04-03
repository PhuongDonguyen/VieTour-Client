import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, FolderOpen, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { getAllCategories, createCategory, updateCategory, deleteCategory, generateSlug } from '@/services/blogCategory.service';
import type { BlogCategory } from '@/apis/blogCategory.api';
import { useAuth } from '@/hooks/useAuth';

interface CategoryFormData {
    title: string;
    desc: string;
    thumbnail: string;
    is_active: boolean;
}

const BlogCategories: React.FC = () => {
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        title: '',
        desc: '',
        thumbnail: '',
        is_active: true
    });
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    // Fetch categories from API
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const categories = await getAllCategories();
            setCategories(categories);
        } catch (err) {
            setError('Không thể tải danh mục blog');
            console.error('Lỗi khi tải danh mục:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const filteredCategories = categories.filter(category =>
        category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.desc && category.desc.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async () => {
        if (!formData.title.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            if (editingCategory) {
                // Update existing category
                await updateCategory(editingCategory.id, formData);
            } else {
                // Create new category
                await createCategory({
                    ...formData,
                    slug: generateSlug(formData.title)
                });
            }

            await fetchCategories();
            resetForm();
            setIsDialogOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể lưu danh mục');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (category: BlogCategory) => {
        setEditingCategory(category);
        setFormData({
            title: category.title,
            desc: category.desc || '',
            thumbnail: category.thumbnail || '',
            is_active: category.is_active
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (categoryId: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này? Hành động này không thể hoàn tác.')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await deleteCategory(categoryId);
            await fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể xóa danh mục');
        } finally {
            setIsLoading(false);
        }
    };

    const toggleStatus = async (categoryId: number) => {
        const category = categories.find(cat => cat.id === categoryId);
        if (!category) return;

        setIsLoading(true);
        setError(null);

        try {
            await updateCategory(categoryId, {
                is_active: !category.is_active
            });
            await fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái danh mục');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            desc: '',
            thumbnail: '',
            is_active: true
        });
        setEditingCategory(null);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        resetForm();
    };

    const totalCategories = categories.length;
    const activeCategories = categories.filter(cat => cat.is_active).length;
    const totalPosts = categories.reduce((sum, cat) => sum + (cat.post_count || 0), 0);

    if (isLoading && categories.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Danh mục Blog</h1>
                    <p className="text-muted-foreground">
                        Tổ chức bài viết blog với danh mục và quản lý cấu trúc nội dung
                    </p>
                </div>

                {isAdmin && (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => setIsDialogOpen(true)} className="flex items-center space-x-2">
                                <Plus className="w-4 h-4" />
                                <span>Thêm Danh mục</span>
                            </Button>
                        </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'Chỉnh sửa Danh mục' : 'Tạo Danh mục Mới'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory ? 'Cập nhật thông tin danh mục' : 'Thêm danh mục mới để tổ chức bài viết blog'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Tiêu đề Danh mục</Label>
                                <Input
                                    id="title"
                                    placeholder="Ví dụ: Mẹo Du lịch"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="desc">Mô tả</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Mô tả ngắn gọn về danh mục này..."
                                    value={formData.desc}
                                    onChange={(e) => handleInputChange('desc', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="thumbnail">URL Hình ảnh</Label>
                                <Input
                                    id="thumbnail"
                                    type="url"
                                    placeholder="https://example.com/thumbnail.jpg"
                                    value={formData.thumbnail}
                                    onChange={(e) => handleInputChange('thumbnail', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                                    className="rounded"
                                />
                                <Label htmlFor="is_active">Hoạt động (hiển thị cho người dùng)</Label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button variant="outline" onClick={handleDialogClose}>
                                Hủy
                            </Button>
                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Đang lưu...' : (editingCategory ? 'Cập nhật' : 'Tạo')} Danh mục
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Danh mục</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCategories}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeCategories} hoạt động
                        </p>
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Bài viết</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPosts}</div>
                        <p className="text-xs text-muted-foreground">
                            Trên tất cả danh mục
                        </p>
                    </CardContent>
                </Card> */}

                {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">TB Bài viết/Danh mục</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalCategories > 0 ? Math.round(totalPosts / totalCategories) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Bài viết mỗi danh mục
                        </p>
                    </CardContent>
                </Card> */}
            </div>

            {/* Search and Filter */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Tìm kiếm danh mục..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" onClick={fetchCategories} disabled={isLoading}>
                            {isLoading ? 'Đang tải...' : 'Làm mới'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Danh mục</TableHead>
                                <TableHead>Mô tả</TableHead>
                                {/* <TableHead>Bài viết</TableHead> */}
                                <TableHead>Trạng thái</TableHead>
                                <TableHead>Ngày tạo</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        {searchTerm ? 'Không tìm thấy danh mục nào phù hợp với tìm kiếm' : 'Không tìm thấy danh mục nào'}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredCategories.map((category) => (
                                    <TableRow key={category.id}>
                                        <TableCell>
                                            <div className="flex items-center space-x-3">
                                                {category.thumbnail && (
                                                    <img
                                                        src={category.thumbnail}
                                                        alt={category.title}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.currentTarget.style.display = 'none';
                                                        }}
                                                    />
                                                )}
                                                <div>
                                                    <div className="font-medium">{category.title}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        /{category.slug}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="truncate" title={category.desc}>
                                                {category.desc || 'Không có mô tả'}
                                            </div>
                                        </TableCell>
                                        {/* <TableCell>
                                            <Badge variant="secondary">
                                                {category.post_count || 0} bài viết
                                            </Badge>
                                        </TableCell> */}
                                        <TableCell>
                                            <button
                                                onClick={() => toggleStatus(category.id)}
                                                disabled={isLoading}
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${category.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {category.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            {category.created_at ? new Date(category.created_at).toLocaleDateString('vi-VN') : 'N/A'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(category)}
                                                    disabled={isLoading}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" disabled={isLoading}>
                                                            <Trash2 className="w-4 h-4 text-destructive" />
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Xóa Danh mục</DialogTitle>
                                                            <DialogDescription>
                                                                Bạn có chắc chắn muốn xóa "{category.title}"?
                                                                Điều này sẽ ảnh hưởng đến {category.post_count || 0} bài viết blog.
                                                                Hành động này không thể hoàn tác.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="flex justify-end gap-2">
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline">Hủy</Button>
                                                            </DialogTrigger>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => handleDelete(category.id)}
                                                                disabled={isLoading}
                                                            >
                                                                {isLoading ? 'Đang xóa...' : 'Xóa'}
                                                            </Button>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default BlogCategories;
