import React, { useState, useEffect, useCallback } from 'react';
import { getAllCategories } from '../../services/blogCategory.service';
import type { BlogCategory } from '@/apis/blogCategory.api';

const AdminBlogCategories: React.FC = () => {
    const [categories, setCategories] = useState<BlogCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCategory, setEditingCategory] = useState<BlogCategory | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        slug: '',
        thumbnail: '',
        is_active: true
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

    // Filters
    const [showActiveOnly, setShowActiveOnly] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAllCategories({
                page: currentPage,
                limit: pageSize,
                is_active: showActiveOnly
            });
            setCategories(response.data);
            setTotalPages(response.totalPages);

            console.log({ categories });
        } catch (err) {
            setError('Không thể tải danh mục blog');
            console.error('Lỗi khi tải danh mục:', err);
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, showActiveOnly]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEditing && editingCategory) {
                // Update existing category
                await BlogCategoryService.updateCategory(editingCategory.id, formData);
            } else {
                // Create new category
                await BlogCategoryService.createCategory(formData);
            }

            // Reset form and refresh data
            resetForm();
            await fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể lưu danh mục');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: BlogCategory) => {
        setIsEditing(true);
        setEditingCategory(category);
        setFormData({
            title: category.title,
            desc: category.desc || '',
            slug: category.slug,
            thumbnail: category.thumbnail || '',
            is_active: category.is_active
        });
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            return;
        }

        setLoading(true);
        try {
            await BlogCategoryService.deleteCategory(id);
            await fetchCategories();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Không thể xóa danh mục');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            desc: '',
            slug: '',
            thumbnail: '',
            is_active: true
        });
        setIsEditing(false);
        setEditingCategory(null);
    };

    const generateSlugFromTitle = () => {
        if (formData.title) {
            const slug = BlogCategoryService.generateSlug(formData.title);
            setFormData(prev => ({ ...prev, slug }));
        }
    };

    console.log({ categories });

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Quản lý Danh mục Blog
                </h1>
                <p className="text-gray-600">
                    Quản lý danh mục blog để tổ chức nội dung của bạn
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Category Form */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">
                        {isEditing ? 'Chỉnh sửa Danh mục' : 'Thêm Danh mục Mới'}
                    </h2>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tiêu đề *
                            </label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Slug *
                            </label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={generateSlugFromTitle}
                                    className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200 text-sm"
                                >
                                    Tạo tự động
                                </button>
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mô tả
                            </label>
                            <textarea
                                value={formData.desc}
                                onChange={(e) => setFormData(prev => ({ ...prev, desc: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                URL Hình ảnh
                            </label>
                            <input
                                type="url"
                                value={formData.thumbnail}
                                onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium text-gray-700">Hoạt động</span>
                            </label>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-6">
                        {isEditing && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Tạo mới')}
                        </button>
                    </div>
                </form>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4">
                    <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={showActiveOnly}
                                onChange={(e) => setShowActiveOnly(e.target.checked)}
                                className="mr-2"
                            />
                            <span className="text-sm font-medium text-gray-700">Chỉ hiển thị danh mục hoạt động</span>
                        </label>
                        <button
                            onClick={fetchCategories}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Danh sách danh mục</h2>
                </div>

                {loading ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500">Đang tải danh mục...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500">Không tìm thấy danh mục nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tiêu đề
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Slug
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Số bài viết
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {categories.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {category.title}
                                                </div>
                                                {category.desc && (
                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                        {category.desc}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.slug}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {category.post_count || 0}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${category.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {category.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(category)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(category.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                Xóa
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-700">
                                Trang {currentPage} của {totalPages}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                                >
                                    Tiếp
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminBlogCategories;
