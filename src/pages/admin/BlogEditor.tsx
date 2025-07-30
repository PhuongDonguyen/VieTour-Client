import React, { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import slugify from 'slugify';
import { isEqual } from 'lodash';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TinyMCEEditor from '@/components/TinyMCEEditor';
import { getAllCategories, type BlogCategory } from '@/services/blogCategory.service';
import { fetchBlogById, createBlog, updateBlog, type CreateBlogRequest } from '@/services/blog.service';
import { useAuth } from '@/hooks/useAuth';

// Form validation schema
const schema = yup.object({
    title: yup.string().required('Title is required').min(3, 'Title must be at least 3 characters'),
    content: yup.string().required('Content is required').min(10, 'Content must be at least 10 characters'),
    excerpt: yup.string().required('Excerpt is required').max(200, 'Excerpt cannot exceed 200 characters'),
    slug: yup.string().required('Slug is required').matches(/^[a-z0-9-]+$/, 'Slug must be lowercase, alphanumeric with hyphens'),
    category_id: yup.string().required('Category is required'),
    status: yup.string().oneOf(['draft', 'published', 'archived'], 'Invalid status').required('Status is required'),
    thumbnail: yup.mixed().required('Featured image is required').test('is-file-or-string', 'Featured image is required', function(value) {
        return value instanceof File || (typeof value === 'string' && value.length > 0);
    }),
    author: yup.string().required('Author is required').min(2, 'Author must be at least 2 characters'),
}).required();

interface BlogFormData {
    title: string;
    content: string;
    thumbnail: File | string;
    category_id: string;
    status: 'draft' | 'published' | 'archived';
    excerpt: string;
    slug: string;
    author: string;
}

const BlogEditor: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting, isDirty, dirtyFields }, trigger, reset } = useForm<BlogFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: '',
            content: '',
            thumbnail: '',
            category_id: '',
            status: 'draft',
            excerpt: '',
            slug: '',
            author: '',
        },
    });

    const [categories, setCategories] = React.useState<BlogCategory[]>([]);
    const [thumbnailPreview, setThumbnailPreview] = React.useState<string>('');
    const [originalBlogData, setOriginalBlogData] = React.useState<BlogFormData | null>(null);
    const [hasChanges, setHasChanges] = React.useState(false);

    const title = watch('title');
    const formValues = watch();

    // Helper function to generate slug from title
    const generateSlugFromTitle = (title: string) => {
        if (title.trim() === '') return '';
        return slugify(title, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
        });
    };

    // Helper function to create FormData for API calls
    const createFormData = (data: Partial<BlogFormData>) => {
        const formData = new FormData();
        
        Object.entries(data).forEach(([key, value]) => {
            if (value !== undefined && value !== '') {
                formData.append(key, value instanceof File ? value : value.toString());
            }
        });
        
        return formData;
    };

    // Generate slug when title changes
    useEffect(() => {
        const slug = generateSlugFromTitle(title);
        const shouldMarkDirty = !isEditing || (originalBlogData && title !== originalBlogData.title);
        setValue('slug', slug, { shouldDirty: shouldMarkDirty });
    }, [title, setValue, isEditing, originalBlogData]);

    // Check for changes between current form values and original data
    useEffect(() => {
        if (isEditing && originalBlogData) {
            const changesExist = !isEqual(formValues, originalBlogData);
            setHasChanges(changesExist);
        } else {
            setHasChanges(isDirty);
        }
    }, [formValues, originalBlogData, isEditing, isDirty]);

    // Load categories and blog data
    useEffect(() => {
        const loadData = async () => {
            try {
                // Always load categories first
                const categoryList = await getAllCategories();
                setCategories(categoryList);
                
                // Then load blog data if editing
                if (isEditing) {
                    const blog = await fetchBlogById(parseInt(id!));
                    const blogData = {
                        title: blog.title,
                        content: blog.content,
                        thumbnail: blog.thumbnail || '',
                        category_id: blog.category_id.toString(),
                        status: blog.status,
                        excerpt: blog.excerpt,
                        slug: blog.slug,
                        author: blog.author || '',
                    };
                    
                    setOriginalBlogData(blogData);
                    reset(blogData);
                    
                    if (blog.thumbnail) {
                        setThumbnailPreview(blog.thumbnail);
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                if (isEditing) {
                    alert('Error loading blog data. Please try again.');
                    navigate('/admin/blog');
                }
            }
        };

        loadData();
    }, [isEditing, id, navigate, reset]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file));
            setValue('thumbnail', file, { shouldDirty: true });
            trigger('thumbnail');
        }
    };

    const handleRemoveImage = () => {
        setThumbnailPreview('');
        setValue('thumbnail', '', { shouldDirty: true });
        trigger('thumbnail');
    };

    const onSubmit = async (data: BlogFormData, status: 'draft' | 'published') => {
        try {
            if (isEditing) {
                if (!hasChanges && status === originalBlogData?.status) {
                    alert('No changes detected.');
                    return;
                }

                // Create an object with only the changed values
                const changedFields: Partial<BlogFormData> = {};
                
                Object.keys(data).forEach((key) => {
                    const fieldKey = key as keyof BlogFormData;
                    if (!isEqual(data[fieldKey], originalBlogData?.[fieldKey])) {
                        changedFields[fieldKey] = data[fieldKey];
                    }
                });

                // Always include status if it differs
                if (status !== originalBlogData?.status) {
                    changedFields.status = status;
                }

                const formData = createFormData(changedFields);
                await updateBlog(parseInt(id!), formData);
            } else {
                const formData = createFormData(data);
                await createBlog(formData);
            }

            alert(isEditing ? 'Blog post updated successfully!' : 'Blog post created successfully!');
            navigate('/admin/blog');
        } catch (error) {
            console.error('Error saving blog post:', error);
            alert('Error saving blog post. Please try again.');
        }
    };

    const handlePreview = () => {
        window.open('/blog/preview', '_blank');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/blog')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Blog
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
                        onClick={handleSubmit((data) => onSubmit(data, 'published'))} 
                        disabled={isSubmitting || (isEditing && !hasChanges)}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Publish
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Blog Title Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Blog Title</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Input
                                    {...register('title')}
                                    placeholder="Enter blog post title..."
                                    className="text-lg"
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="slug">URL Slug</Label>
                                <Input
                                    {...register('slug')}
                                    placeholder="url-friendly-slug"
                                    className="mt-1 font-mono text-sm"
                                />
                                {errors.slug && title.trim() !== '' && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Auto-generated from title. You can customize it manually.
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="author">Author</Label>
                                <Input
                                    {...register('author')}
                                    placeholder="Enter author name..."
                                    className="mt-1"
                                />
                                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Editor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Content</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <TinyMCEEditor
                                value={watch('content')}
                                onChange={(content) => {
                                    const shouldMarkDirty = !isEditing || content !== originalBlogData?.content;
                                    setValue('content', content, { shouldDirty: shouldMarkDirty });
                                    trigger('content');
                                }}
                                placeholder="Nội dung bài viết..."
                                className="min-h-[400px]"
                            />
                            {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
                        </CardContent>
                    </Card>

                    {/* Excerpt */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Excerpt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                {...register('excerpt')}
                                placeholder="Write a brief excerpt for your blog post..."
                                rows={3}
                            />
                            {errors.excerpt && <p className="text-red-500 text-sm mt-1">{errors.excerpt.message}</p>}
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
                                    {...register('status')}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                    <option value="archived">Archived</option>
                                </select>
                                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="category_id">Category</Label>
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
                                    {...register('category_id')}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Select category</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id.toString()}>
                                            {category.title}
                                        </option>
                                    ))}
                                </select>
                                {errors.category_id && <p className="text-red-500 text-sm mt-1">{errors.category_id.message}</p>}
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
                                        onClick={handleRemoveImage}
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
                            {errors.thumbnail && <p className="text-red-500 text-sm mt-1">{errors.thumbnail.message}</p>}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default BlogEditor;