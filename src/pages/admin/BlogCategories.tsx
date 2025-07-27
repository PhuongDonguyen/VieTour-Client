import React, { useState, useEffect } from 'react';
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

interface BlogCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    color: string;
    post_count: number;
    created_at: string;
    is_active: boolean;
}

interface CategoryFormData {
    name: string;
    description: string;
    color: string;
    is_active: boolean;
}

const BlogCategories: React.FC = () => {
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        color: '#3B82F6',
        is_active: true
    });

    // Mock data for categories
    useEffect(() => {
        const mockCategories: BlogCategory[] = [
            {
                id: 1,
                name: 'Travel Guides',
                slug: 'travel-guides',
                description: 'Comprehensive guides for travelers exploring different destinations',
                color: '#3B82F6',
                post_count: 12,
                created_at: '2024-01-15',
                is_active: true
            },
            {
                id: 2,
                name: 'Food & Culture',
                slug: 'food-culture',
                description: 'Exploring local cuisines and cultural experiences',
                color: '#EF4444',
                post_count: 8,
                created_at: '2024-01-20',
                is_active: true
            },
            {
                id: 3,
                name: 'Tips & Tricks',
                slug: 'tips-tricks',
                description: 'Helpful travel tips and insider secrets',
                color: '#10B981',
                post_count: 15,
                created_at: '2024-02-01',
                is_active: true
            },
            {
                id: 4,
                name: 'Destinations',
                slug: 'destinations',
                description: 'Featured destinations and hidden gems',
                color: '#F59E0B',
                post_count: 20,
                created_at: '2024-02-10',
                is_active: true
            },
            {
                id: 5,
                name: 'Budget Travel',
                slug: 'budget-travel',
                description: 'Affordable travel options and money-saving tips',
                color: '#8B5CF6',
                post_count: 6,
                created_at: '2024-02-15',
                is_active: false
            }
        ];

        setCategories(mockCategories);
        setIsLoading(false);
    }, []);

    const filteredCategories = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleSubmit = () => {
        if (!formData.name.trim()) return;

        const newCategory: BlogCategory = {
            id: editingCategory ? editingCategory.id : Date.now(),
            name: formData.name,
            slug: generateSlug(formData.name),
            description: formData.description,
            color: formData.color,
            post_count: editingCategory ? editingCategory.post_count : 0,
            created_at: editingCategory ? editingCategory.created_at : new Date().toISOString().split('T')[0],
            is_active: formData.is_active
        };

        if (editingCategory) {
            setCategories(prev => prev.map(cat =>
                cat.id === editingCategory.id ? newCategory : cat
            ));
        } else {
            setCategories(prev => [...prev, newCategory]);
        }

        resetForm();
        setIsDialogOpen(false);
    };

    const handleEdit = (category: BlogCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description,
            color: category.color,
            is_active: category.is_active
        });
        setIsDialogOpen(true);
    };

    const handleDelete = (categoryId: number) => {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    };

    const toggleStatus = (categoryId: number) => {
        setCategories(prev => prev.map(cat =>
            cat.id === categoryId ? { ...cat, is_active: !cat.is_active } : cat
        ));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: '#3B82F6',
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
    const totalPosts = categories.reduce((sum, cat) => sum + cat.post_count, 0);

    const colorOptions = [
        { value: '#3B82F6', name: 'Blue' },
        { value: '#EF4444', name: 'Red' },
        { value: '#10B981', name: 'Green' },
        { value: '#F59E0B', name: 'Yellow' },
        { value: '#8B5CF6', name: 'Purple' },
        { value: '#EC4899', name: 'Pink' },
        { value: '#6B7280', name: 'Gray' },
        { value: '#14B8A6', name: 'Teal' }
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
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
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Travel Tips"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Brief description of this category..."
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div>
                                <Label htmlFor="color">Category Color</Label>
                                <div className="flex items-center space-x-2 mt-1">
                                    <input
                                        type="color"
                                        value={formData.color}
                                        onChange={(e) => handleInputChange('color', e.target.value)}
                                        className="w-8 h-8 rounded border"
                                    />
                                    <select
                                        value={formData.color}
                                        onChange={(e) => handleInputChange('color', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
                                    >
                                        {colorOptions.map(color => (
                                            <option key={color.value} value={color.value}>
                                                {color.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
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
                            <Button onClick={handleSubmit}>
                                {editingCategory ? 'Update' : 'Create'} Category
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
                            {filteredCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-3">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{ backgroundColor: category.color }}
                                            />
                                            <div>
                                                <div className="font-medium">{category.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    /{category.slug}
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="max-w-xs">
                                        <div className="truncate" title={category.description}>
                                            {category.description}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {category.post_count} posts
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <button
                                            onClick={() => toggleStatus(category.id)}
                                            className={`px-2 py-1 rounded-full text-xs font-medium ${category.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </TableCell>
                                    <TableCell>
                                        {new Date(category.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEdit(category)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent>
                                                    <DialogHeader>
                                                        <DialogTitle>Delete Category</DialogTitle>
                                                        <DialogDescription>
                                                            Are you sure you want to delete "{category.name}"?
                                                            This will affect {category.post_count} blog posts.
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
                                                        >
                                                            Delete
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
                </CardContent>
            </Card>
        </div>
    );
};

export default BlogCategories;
