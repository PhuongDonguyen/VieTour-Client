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
    title: yup.string().required('Tiêu đề là bắt buộc').min(3, 'Tiêu đề phải có ít nhất 3 ký tự'),
    content: yup.string().required('Nội dung là bắt buộc').min(10, 'Nội dung phải có ít nhất 10 ký tự'),
    excerpt: yup.string().required('Tóm tắt là bắt buộc').max(200, 'Tóm tắt không được vượt quá 200 ký tự'),
    slug: yup.string().required('Slug là bắt buộc').matches(/^[a-z0-9-]+$/, 'Slug phải là chữ thường, số và dấu gạch ngang'),
    category_id: yup.string().required('Danh mục là bắt buộc'),
    status: yup.string().oneOf(['draft', 'published', 'archived'], 'Trạng thái không hợp lệ').required('Trạng thái là bắt buộc'),
    thumbnail: yup.mixed().required('Hình ảnh đại diện là bắt buộc').test('is-file-or-string', 'Hình ảnh đại diện là bắt buộc', function(value) {
        return value instanceof File || (typeof value === 'string' && value.length > 0);
    }),
    author: yup.string().required('Tác giả là bắt buộc').min(2, 'Tác giả phải có ít nhất 2 ký tự'),
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
                console.error('Lỗi khi tải dữ liệu:', error);
                if (isEditing) {
                    alert('Lỗi khi tải dữ liệu blog. Vui lòng thử lại.');
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
                    alert('Không có thay đổi nào được phát hiện.');
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

            alert(isEditing ? 'Bài viết đã được cập nhật thành công!' : 'Bài viết đã được tạo thành công!');
            navigate('/admin/blog');
        } catch (error) {
            console.error('Lỗi khi lưu bài viết:', error);
            alert('Lỗi khi lưu bài viết. Vui lòng thử lại.');
        }
    };

    const handlePreview = () => {
        window.open('/blog/preview', '_blank');
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/admin/blog')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại Blog
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">
                            {isEditing ? 'Chỉnh sửa Bài viết' : 'Tạo Bài viết Mới'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isEditing ? 'Cập nhật bài viết của bạn' : 'Viết và xuất bản bài viết mới'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button 
                        onClick={handleSubmit((data) => onSubmit(data, 'published'))} 
                        disabled={isSubmitting || (isEditing && !hasChanges)}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Xuất bản
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Blog Title Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tiêu đề Bài viết</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Input
                                    {...register('title')}
                                    placeholder="Nhập tiêu đề bài viết..."
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
                                    Tự động tạo từ tiêu đề. Bạn có thể tùy chỉnh thủ công.
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="author">Tác giả</Label>
                                <Input
                                    {...register('author')}
                                    placeholder="Nhập tên tác giả..."
                                    className="mt-1"
                                />
                                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author.message}</p>}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Editor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Nội dung</CardTitle>
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
                            <CardTitle>Tóm tắt</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                {...register('excerpt')}
                                placeholder="Viết tóm tắt ngắn gọn cho bài viết..."
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
                            <CardTitle>Cài đặt Xuất bản</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="status">Trạng thái</Label>
                                <select
                                    {...register('status')}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="draft">Bản nháp</option>
                                    <option value="published">Đã xuất bản</option>
                                    <option value="archived">Đã lưu trữ</option>
                                </select>
                                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
                            </div>

                            <div>
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="category_id">Danh mục</Label>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => navigate('/admin/blog-categories')}
                                        type="button"
                                    >
                                        Quản lý Danh mục
                                    </Button>
                                </div>
                                <select
                                    {...register('category_id')}
                                    className="w-full mt-1 px-3 py-2 border border-input rounded-md bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    <option value="">Chọn danh mục</option>
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
                            <CardTitle>Hình ảnh Đại diện</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {thumbnailPreview ? (
                                <div className="space-y-4">
                                    <img
                                        src={thumbnailPreview}
                                        alt="Xem trước hình ảnh"
                                        className="w-full h-48 object-cover rounded-md"
                                    />
                                    <Button
                                        variant="outline"
                                        onClick={handleRemoveImage}
                                        className="w-full"
                                    >
                                        Xóa Hình ảnh
                                    </Button>
                                </div>
                            ) : (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-muted-foreground/25 rounded-md p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                                >
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        Nhấp để tải lên hình ảnh đại diện
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