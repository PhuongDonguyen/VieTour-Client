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
  is_liked?: boolean;
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
  slug?: string;
}

export interface BlogResponse {
  success: boolean;
  data: BlogPost[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
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

export const getUserBlogs = async (params?: BlogQueryParams): Promise<BlogResponse> => {
  const response = await axiosInstance.get('/api/blogs/with-like-status', { params });
  return response.data;
};
