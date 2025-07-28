import * as blogApi from '../apis/blog.api';

import type {
  BlogPost,
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogQueryParams,
  BlogResponse
} from '../apis/blog.api';

// Re-export types for convenience
export type {
  BlogPost,
  CreateBlogRequest,
  UpdateBlogRequest,
  BlogQueryParams,
  BlogResponse
};

// Fetch all blogs with optional filtering
export const fetchBlogs = async (params?: BlogQueryParams): Promise<BlogPost[]> => {
  try {
    const blogData = await blogApi.getAllBlogs(params);
    return blogData.data;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

// Fetch blogs with pagination info
export const fetchBlogsWithPagination = async (params?: BlogQueryParams): Promise<BlogResponse> => {
  try {
    return await blogApi.getAllBlogs(params);
  } catch (error) {
    console.error('Error fetching blogs with pagination:', error);
    throw error;
  }
};

// Fetch a single blog by ID
export const fetchBlogById = async (id: number): Promise<BlogPost> => {
  try {
    const response = await blogApi.getBlogById(id);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog by ID:', error);
    throw error;
  }
};

// Fetch a single blog by slug
export const fetchBlogBySlug = async (slug: string): Promise<BlogPost> => {
  try {
    const response = await blogApi.getBlogBySlug(slug);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog by slug:', error);
    throw error;
  }
};

// Fetch blogs by category
export const fetchBlogsByCategory = async (
  categoryId: number,
  page = 1,
  limit = 10
): Promise<BlogResponse> => {
  try {
    return await blogApi.getBlogsByCategory(categoryId, { page, limit });
  } catch (error) {
    console.error('Error fetching blogs by category:', error);
    throw error;
  }
};

// Fetch blogs by author
export const fetchBlogsByAuthor = async (
  authorId: number,
  page = 1,
  limit = 10
): Promise<BlogResponse> => {
  try {
    return await blogApi.getBlogsByAuthor(authorId, { page, limit });
  } catch (error) {
    console.error('Error fetching blogs by author:', error);
    throw error;
  }
};

// Create a new blog post
export const createBlog = async (blogData: FormData): Promise<BlogPost> => {
  try {
    const response = await blogApi.createBlog(blogData);
    return response.data;
  } catch (error) {
    console.error('Error creating blog:', error);
    throw error;
  }
};

// Update an existing blog post
export const updateBlog = async (id: number, blogData: FormData): Promise<BlogPost> => {
  try {
    const response = await blogApi.updateBlog(id, blogData);
    return response.data;
  } catch (error) {
    console.error('Error updating blog:', error);
    throw error;
  }
};

// Delete a blog post
export const deleteBlog = async (id: number): Promise<boolean> => {
  try {
    await blogApi.deleteBlog(id);
    return true;
  } catch (error) {
    console.error('Error deleting blog:', error);
    throw error;
  }
};

// Fetch published blogs (public endpoint)
export const fetchPublishedBlogs = async (params?: {
  category_id?: number;
  page?: number;
  limit?: number;
  search?: string;
}): Promise<BlogResponse> => {
  try {
    return await blogApi.getPublishedBlogs(params);
  } catch (error) {
    console.error('Error fetching published blogs:', error);
    throw error;
  }
};

// Fetch popular blogs
export const fetchPopularBlogs = async (limit = 5): Promise<BlogPost[]> => {
  try {
    const response = await blogApi.getPopularBlogs(limit);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular blogs:', error);
    throw error;
  }
};

// Fetch recent blogs
export const fetchRecentBlogs = async (limit = 10): Promise<BlogPost[]> => {
  try {
    const response = await blogApi.getRecentBlogs(limit);
    return response.data;
  } catch (error) {
    console.error('Error fetching recent blogs:', error);
    throw error;
  }
};

// Search blogs
export const searchBlogs = async (
  query: string,
  params?: {
    category_id?: number;
    page?: number;
    limit?: number;
  }
): Promise<BlogResponse> => {
  try {
    return await blogApi.searchBlogs(query, params);
  } catch (error) {
    console.error('Error searching blogs:', error);
    throw error;
  }
};

// Increment blog views
export const incrementViews = async (id: number): Promise<number> => {
  try {
    const response = await blogApi.incrementBlogViews(id);
    return response.view_count;
  } catch (error) {
    console.error('Error incrementing blog views:', error);
    throw error;
  }
};

// Fetch blog statistics
export const fetchBlogStats = async () => {
  try {
    return await blogApi.getBlogStats();
  } catch (error) {
    console.error('Error fetching blog stats:', error);
    throw error;
  }
};

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Validate blog data
export const validateBlogData = (blogData: Partial<CreateBlogRequest>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!blogData.title || blogData.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (blogData.title.length > 255) {
    errors.push('Title must be less than 255 characters');
  }

  if (!blogData.content || blogData.content.trim().length === 0) {
    errors.push('Content is required');
  } else if (blogData.content.length < 10) {
    errors.push('Content must be at least 10 characters');
  }

  if (!blogData.excerpt || blogData.excerpt.trim().length === 0) {
    errors.push('Excerpt is required');
  } else if (blogData.excerpt.length > 500) {
    errors.push('Excerpt must be less than 500 characters');
  }

  if (!blogData.slug || blogData.slug.trim().length === 0) {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(blogData.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (!blogData.category_id) {
    errors.push('Category is required');
  }

  if (!blogData.author || blogData.author.trim().length === 0) {
    errors.push('Author is required');
  }

  if (blogData.status && !['draft', 'published', 'archived'].includes(blogData.status)) {
    errors.push('Invalid status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format blog for display
export const formatBlogForDisplay = (blog: BlogPost) => {
  return {
    ...blog,
    displayTitle: blog.title.length > 60 ? `${blog.title.substring(0, 60)}...` : blog.title,
    displayExcerpt: blog.excerpt.length > 150 ? `${blog.excerpt.substring(0, 150)}...` : blog.excerpt,
    formattedDate: new Date(blog.created_at).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    readTime: Math.ceil(blog.content.split(' ').length / 200) // Assuming 200 words per minute
  };
};

// Get status badge color
export const getStatusBadgeColor = (status: BlogPost['status']): string => {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800';
    case 'draft':
      return 'bg-yellow-100 text-yellow-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 