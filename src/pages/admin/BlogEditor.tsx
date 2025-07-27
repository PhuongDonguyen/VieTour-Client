import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import TinyMCEEditor from '@/components/TinyMCEEditor';
import { fetchActiveBlogCategories, type BlogCategory } from '@/services/blogCategory.service';

interface BlogFormData {
    title: string;
    content: string;
    thumbnail: string;
    category_id: string;
    status: 'draft' | 'published' | 'archived';
    excerpt: string;
    tags: string[];
}



const BlogEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<BlogFormData>({
        title: '',
        content: '',
        thumbnail: '',
        category_id: '',
        status: 'draft',
        excerpt: '',
        tags: []
    });

    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

    // Load categories on component mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categoryList = await fetchActiveBlogCategories();
                setCategories(categoryList);
            } catch (error) {
                console.error('Error loading categories:', error);
            }
        };
        loadCategories();
    }, []);

    useEffect(() => {
        if (isEditing) {
            // TODO: Fetch blog data for editing
            // For now, use mock data with rich text content
            setFormData({
                title: 'Sample Blog Post: Exploring the Hidden Gems of Vietnam',
                content: `<h2>Welcome to Vietnam's Hidden Treasures</h2>
<p>Vietnam is a country of <strong>breathtaking landscapes</strong>, rich culture, and incredible hospitality. Beyond the popular destinations like <em>Ha Long Bay</em> and <em>Ho Chi Minh City</em>, there are countless hidden gems waiting to be discovered.</p>

<h3>Must-Visit Hidden Destinations</h3>
<ol>
<li><strong>Mu Cang Chai Terraces</strong> - Stunning rice terraces in the mountains</li>
<li><strong>Phong Nha-Ke Bang National Park</strong> - Amazing cave systems</li>
<li><strong>Con Dao Islands</strong> - Pristine beaches and marine life</li>
</ol>

<blockquote>
<p>"Vietnam is not just a destination, it's an experience that stays with you forever." - Travel enthusiast</p>
</blockquote>

<p>Whether you're seeking <u>adventure</u>, <u>culture</u>, or <u>relaxation</u>, Vietnam has something special for every traveler.</p>`,
                thumbnail: '/sample-image.jpg',
                category_id: '1',
                status: 'draft',
                excerpt: 'Discover the hidden gems of Vietnam beyond the tourist hotspots. From stunning rice terraces to pristine islands, explore the authentic beauty of this incredible country.',
                tags: ['travel', 'vietnam', 'hidden gems', 'destinations']
            });
            setThumbnailPreview('/sample-image.jpg');
        }
    }, [isEditing]);

    const handleInputChange = (field: keyof BlogFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleContentChange = (content: string) => {
        setFormData(prev => ({
            ...prev,
            content
        }));
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // TODO: Upload to server
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setThumbnailPreview(result);
                setFormData(prev => ({
                    ...prev,
                    thumbnail: result // In real app, this would be the uploaded URL
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const addTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleSave = async (status: 'draft' | 'published') => {
        setIsLoading(true);
        try {
            const dataToSave = {
                ...formData,
                status
            };

            // TODO: Implement save API call
            console.log('Saving blog post:', dataToSave);

            // Mock save delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            navigate('/admin/blog');
        } catch (error) {
            console.error('Error saving blog post:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreview = () => {
        // TODO: Implement preview functionality
        window.open('/blog/preview', '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/admin/blog')}
                        className="flex items-center space-x-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Blog</span>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing ? 'Edit Blog Post' : 'Create New Blog Post'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing ? 'Update your blog post' : 'Write and publish a new blog post'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        onClick={handlePreview}
                        className="flex items-center space-x-2"
                    >
                        <Eye className="w-4 h-4" />
                        <span>Preview</span>
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleSave('draft')}
                        disabled={isLoading}
                        className="flex items-center space-x-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>Save Draft</span>
                    </Button>
                    <Button
                        onClick={() => handleSave('published')}
                        disabled={isLoading}
                        className="flex items-center space-x-2"
                    >
                        <Save className="w-4 h-4" />
                        <span>Publish</span>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Blog Title</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Input
                                placeholder="Enter blog post title..."
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                className="text-lg"
                            />
                        </CardContent>
                    </Card>

                    {/* Content Editor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TinyMCEEditor
                                value={formData.content}
                                onChange={handleContentChange}
                                placeholder="Nội dung bài viết..."
                                className="min-h-[400px]"
                            />
                        </CardContent>
                    </Card>

                    {/* Excerpt */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Excerpt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="Write a brief excerpt for your blog post..."
                                value={formData.excerpt}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('excerpt', e.target.value)}
                                rows={3}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Publish Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Publish Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="status">Status</Label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => handleInputChange('status', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="category">Category</Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate('/admin/blog-categories')}
                                        type="button"
                                    >
                                        Manage Categories
                                    </Button>
                                </div>
                                <select
                                    value={formData.category_id}
                                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Featured Image */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Featured Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {thumbnailPreview ? (
                                <div className="space-y-4">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className="w-full h-48 object-cover rounded-md"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setThumbnailPreview('');
                                            setFormData(prev => ({ ...prev, thumbnail: '' }));
                                        }}
                                        className="w-full"
                                    >
                                        Remove Image
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                                >
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Click to upload featured image
                                    </p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                            />
                        </CardContent>
                    </Card>

                    {/* Tags */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tags</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="Add tag..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                />
                                <Button onClick={addTag}>Add</Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                        {tag}
                                        <X
                                            className="w-3 h-3 cursor-pointer"
                                            onClick={() => removeTag(tag)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BlogEditor;
