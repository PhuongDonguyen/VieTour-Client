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
import { getActiveCategories } from '@/services/blogCategory.service';
import type { BlogCategory } from '@/apis/blogCategory.api';

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

    // Fetch categories from API
    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const categories = await getActiveCategories();
            setCategories(categories);
        } catch (err) {
            setError('Failed to fetch blog categories');
            console.error('Error fetching categories:', err);
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
                await BlogCategoryService.updateCategory(editingCategory.id, formData);
            } else {
                // Create new category
                await BlogCategoryService.createCategory({
                    ...formData,
                    slug: BlogCategoryService.generateSlug(formData.title)
                });
            }

            await fetchCategories();
            resetForm();
            setIsDialogOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save category');
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
        if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await BlogCategoryService.deleteCategory(categoryId);
            await fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete category');
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
            await BlogCategoryService.updateCategory(categoryId, {
                is_active: !category.is_active
            });
            await fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update category status');
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
        <div className="space-y-6">
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Blog Categories</h1>
                    <p className="text-muted-foreground">
                        Organize your blog posts with categories and manage content structure
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setIsDialogOpen(true)} className="flex items-center space-x-2">
                            <Plus className="w-4 h-4" />
                            <span>Add Category</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                            </DialogTitle>
                            <DialogDescription>
                                {editingCategory ? 'Update category information' : 'Add a new category to organize your blog posts'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="title">Category Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Travel Tips"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="desc">Description</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Brief description of this category..."
                                    value={formData.desc}
                                    onChange={(e) => handleInputChange('desc', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="thumbnail">Thumbnail URL</Label>
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
                                <Label htmlFor="is_active">Active (visible to users)</Label>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-2 mt-6">
                            <Button variant="outline" onClick={handleDialogClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isLoading}>
                                {isLoading ? 'Saving...' : (editingCategory ? 'Update' : 'Create')} Category
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCategories}</div>
                        <p className="text-xs text-muted-foreground">
                            {activeCategories} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPosts}</div>
                        <p className="text-xs text-muted-foreground">
                            Across all categories
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Posts/Category</CardTitle>
                        <Hash className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalCategories > 0 ? Math.round(totalPosts / totalCategories) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Posts per category
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filter */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button variant="outline" onClick={fetchCategories} disabled={isLoading}>
                            {isLoading ? 'Loading...' : 'Refresh'}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Category</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Posts</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCategories.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        {searchTerm ? 'No categories found matching your search' : 'No categories found'}
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
                                                {category.desc || 'No description'}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {category.post_count || 0} posts
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <button
                                                onClick={() => toggleStatus(category.id)}
                                                disabled={isLoading}
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${category.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}
                                            >
                                                {category.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                        </TableCell>
                                        <TableCell>
                                            {category.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
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
                                                            <DialogTitle>Delete Category</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete "{category.title}"?
                                                                This will affect {category.post_count || 0} blog posts.
                                                                This action cannot be undone.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="flex justify-end gap-2">
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline">Cancel</Button>
                                                            </DialogTrigger>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => handleDelete(category.id)}
                                                                disabled={isLoading}
                                                            >
                                                                {isLoading ? 'Deleting...' : 'Delete'}
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
