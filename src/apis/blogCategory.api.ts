import axiosInstance from './axiosInstance';

// Interface for blog categories
export interface BlogCategory {
  id: number;
  title: string;
  desc?: string;
  slug: string;
  thumbnail?: string;
  is_active: boolean;
  post_count?: number;
  created_at?: string;
  updated_at?: string;
}

// Interface for creating blog categories
export interface CreateBlogCategoryRequest {
  title: string;
  desc?: string;
  slug: string;
  thumbnail?: string;
  is_active?: boolean;
}

// Interface for updating blog categories
export interface UpdateBlogCategoryRequest {
  title?: string;
  desc?: string;
  slug?: string;
  thumbnail?: string;
  is_active?: boolean;
}

// Interface for API response with data
export interface BlogCategoryResponse {
  success: boolean;
  data: BlogCategory;
}

// Interface for API response with list data
export interface BlogCategoryListResponse {
  success: boolean;
  data: BlogCategory[];
}

// Interface for delete response
export interface DeleteResponse {
  success: boolean;
}

// Get all blog categories
export const getAllBlogCategories = async (params?: {
  is_active?: boolean;
}): Promise<BlogCategoryListResponse> => {
  const response = await axiosInstance.get('/api/blog-categories', { params });
  return response.data;
};

// Get blog category by ID
export const getBlogCategoryById = async (id: number): Promise<BlogCategoryResponse> => {
  const response = await axiosInstance.get(`/api/blog-categories/${id}`);
  return response.data;
};

// Create a new blog category
export const createBlogCategory = async (categoryData: CreateBlogCategoryRequest): Promise<BlogCategoryResponse> => {
  const response = await axiosInstance.post('/api/blog-categories', categoryData);
  return response.data;
};

// Update an existing blog category
export const updateBlogCategory = async (id: number, categoryData: UpdateBlogCategoryRequest): Promise<BlogCategoryResponse> => {
  const response = await axiosInstance.put(`/api/blog-categories/${id}`, categoryData);
  return response.data;
};

// Delete a blog category
export const deleteBlogCategory = async (id: number): Promise<DeleteResponse> => {
  const response = await axiosInstance.delete(`/api/blog-categories/${id}`);
  return response.data;
};