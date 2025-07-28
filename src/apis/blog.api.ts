import axiosInstance from './axiosInstance';

// Blog interfaces
export interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  slug: string;
  category_id: number;
  account_id: number;
  author: string;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  excerpt: string;
  thumbnail: string;
  slug: string;
  category_id: string | number;
  account_id: string | number;
  author: string;
  status: 'draft' | 'published' | 'archived';
}

export interface UpdateBlogRequest {
  title?: string;
  content?: string;
  excerpt?: string;
  thumbnail?: string;
  slug?: string;
  category_id?: string | number;
  status?: 'draft' | 'published' | 'archived';
}

export interface BlogQueryParams {
  category_id?: number;
  status?: 'draft' | 'published' | 'archived';
  page?: number;
  limit?: number;
  search?: string;
  author_id?: number;
}

export interface BlogResponse {
  data: BlogPost[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BlogDetailResponse {
  data: BlogPost;
}

// API Functions

/**
 * Get all blogs with optional filters
 */
export const getAllBlogs = async (params?: BlogQueryParams): Promise<BlogResponse> => {
  const response = await axiosInstance.get('/api/blogs', { params });
  return response.data;
};

/**
 * Get blog by ID
 */
export const getBlogById = async (id: number): Promise<BlogDetailResponse> => {
  const response = await axiosInstance.get(`/api/blogs/${id}`);
  return response.data;
};

/**
 * Get blog by slug
 */
export const getBlogBySlug = async (slug: string): Promise<BlogDetailResponse> => {
  const response = await axiosInstance.get(`/api/blogs/slug/${slug}`);
  return response.data;
};

/**
 * Get blogs by category
 */
export const getBlogsByCategory = async (
  categoryId: number,
  params?: { page?: number; limit?: number }
): Promise<BlogResponse> => {
  const response = await axiosInstance.get(`/api/blogs/category/${categoryId}`, { params });
  return response.data;
};

/**
 * Get blogs by author
 */
export const getBlogsByAuthor = async (
  authorId: number,
  params?: { page?: number; limit?: number }
): Promise<BlogResponse> => {
  const response = await axiosInstance.get(`/api/blogs/author/${authorId}`, { params });
  return response.data;
};

/**
 * Create a new blog post
 */
export const createBlog = async (blogData: FormData): Promise<BlogDetailResponse> => {
  const response = await axiosInstance.post('/api/blogs', blogData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update an existing blog post
 */
export const updateBlog = async (id: number, blogData: FormData): Promise<BlogDetailResponse> => {
  const response = await axiosInstance.put(`/api/blogs/${id}`, blogData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Delete a blog post
 */
export const deleteBlog = async (id: number): Promise<{ message: string }> => {
  const response = await axiosInstance.delete(`/api/blogs/${id}`);
  return response.data;
};

/**
 * Get published blogs (public endpoint)
 */
export const getPublishedBlogs = async (params?: { 
  category_id?: number; 
  page?: number; 
  limit?: number; 
  search?: string;
}): Promise<BlogResponse> => {
  const response = await axiosInstance.get('/api/blogs', { 
    params: { ...params, status: 'published' } 
  });
  return response.data;
};

/**
 * Get popular blogs (most viewed)
 */
export const getPopularBlogs = async (limit = 5): Promise<BlogResponse> => {
  const response = await axiosInstance.get('/api/blogs/popular', { 
    params: { limit } 
  });
  return response.data;
};

/**
 * Get recent blogs
 */
export const getRecentBlogs = async (limit = 10): Promise<BlogResponse> => {
  const response = await axiosInstance.get('/api/blogs/recent', { 
    params: { limit } 
  });
  return response.data;
};

/**
 * Search blogs
 */
export const searchBlogs = async (query: string, params?: {
  category_id?: number;
  page?: number;
  limit?: number;
}): Promise<BlogResponse> => {
  const response = await axiosInstance.get('/api/blogs/search', {
    params: { q: query, ...params }
  });
  return response.data;
};

/**
 * Increment blog view count
 */
export const incrementBlogViews = async (id: number): Promise<{ view_count: number }> => {
  const response = await axiosInstance.post(`/api/blogs/${id}/view`);
  return response.data;
};

/**
 * Get blog statistics
 */
export const getBlogStats = async (): Promise<{
  total_blogs: number;
  published_blogs: number;
  draft_blogs: number;
  archived_blogs: number;
  total_views: number;
  total_likes: number;
}> => {
  const response = await axiosInstance.get('/api/blogs/stats');
  return response.data;
};
