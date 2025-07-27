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
import { fetchBlogCategories, type BlogCategory } from '@/services/blogCategory.service';

interface BlogPost {
    id: number;
    title: string;
    content: string;
    thumbnail: string;
    category_id: number;
    account_id: number;
    author: string;
    created_at: string;
    updated_at: string;
    status: 'draft' | 'published' | 'archived';
}

const AdminBlog: React.FC = () => {
    const [blogs, setBlogs] = useState<BlogPost[]>([]);
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    // Load categories
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryList = await fetchBlogCategories();
                setCategories(categoryList);
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };
        loadCategories();
    }, []);

    // Mock data for now - replace with actual API calls
    useEffect(() => {
        const mockBlogs: BlogPost[] = [
            {
                id: 1,
                title: "Top 10 Must-Visit Destinations in Vietnam",
                content: "Discover the most beautiful places in Vietnam...",
                thumbnail: "/blog-1.jpg",
                category_id: 1,
                account_id: 1,
                author: "Admin User",
                created_at: "2024-01-15T10:00:00Z",
                updated_at: "2024-01-15T10:00:00Z",
                status: "published"
            },
            {
                id: 2,
                title: "Vietnamese Street Food Guide",
                content: "A comprehensive guide to Vietnamese street food...",
                thumbnail: "/blog-2.jpg",
                category_id: 2,
                account_id: 1,
                author: "Food Blogger",
                created_at: "2024-01-10T14:30:00Z",
                updated_at: "2024-01-12T09:15:00Z",
                status: "published"
            },
            {
                id: 3,
                title: "Planning Your Perfect Halong Bay Trip",
                content: "Everything you need to know about visiting Halong Bay...",
                thumbnail: "/blog-3.jpg",
                category_id: 1,
                account_id: 2,
                author: "Travel Expert",
                created_at: "2024-01-08T11:20:00Z",
                updated_at: "2024-01-08T11:20:00Z",
                status: "draft"
            }
        ];

        setTimeout(() => {
            setBlogs(mockBlogs);
            setIsLoading(false);
        }, 1000);
    }, []);

    const filteredBlogs = blogs.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === 'all' || blog.category_id.toString() === selectedCategory)
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'default';
            case 'draft': return 'secondary';
            case 'archived': return 'destructive';
            default: return 'outline';
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
        return category ? category.name : 'Unknown';
    };

    const handleDelete = async (blogId: number) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            // TODO: Implement delete API call
            setBlogs(blogs.filter(blog => blog.id !== blogId));
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Blog Management</h1>
                    <p className="text-muted-foreground">Manage your blog posts and articles</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate('/admin/blog-categories')}
                        className="flex items-center gap-2"
                    >
                        Manage Categories
                    </Button>
                    <Button onClick={() => navigate('/admin/blog/new')} className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        New Post
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Published</p>
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
                                <p className="text-sm font-medium text-muted-foreground">Drafts</p>
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
                                <p className="text-sm font-medium text-muted-foreground">This Month</p>
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
                    <CardTitle>Blog Posts</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                            <Input
                                placeholder="Search blog posts..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
                        >
                            <option value="all">All Categories</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id.toString()}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Blog Posts Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
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
                                                {blog.status}
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
                                                    onClick={() => window.open(`/blog/${blog.id}`, '_blank')}
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
                                                            <DialogTitle>Delete Blog Post</DialogTitle>
                                                            <DialogDescription>
                                                                Are you sure you want to delete "{blog.title}"? This action cannot be undone.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="flex justify-end gap-2">
                                                            <DialogTrigger asChild>
                                                                <Button variant="outline">Cancel</Button>
                                                            </DialogTrigger>
                                                            <Button
                                                                variant="destructive"
                                                                onClick={() => handleDelete(blog.id)}
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminBlog;
