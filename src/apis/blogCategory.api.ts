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

// Get active blog categories only
export const getActiveBlogCategories = async (): Promise<BlogCategoryListResponse> => {
  const response = await axiosInstance.get('/api/blog-categories', { 
    params: { is_active: true } 
  });
  return response.data;
};

// Get blog category by ID
export const getBlogCategoryById = async (id: number): Promise<BlogCategoryResponse> => {
  const response = await axiosInstance.get(`/api/blog-categories/${id}`);
  return response.data;
};

// Get blog category by slug
export const getBlogCategoryBySlug = async (slug: string): Promise<BlogCategoryResponse> => {
  const response = await axiosInstance.get(`/api/blog-categories/slug/${slug}`);
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

// Check if slug is available (for validation)
export const checkSlugAvailability = async (slug: string, excludeId?: number): Promise<boolean> => {
  try {
    const params = excludeId ? { exclude_id: excludeId } : {};
    const response = await axiosInstance.get(`/api/blog-categories/check-slug/${slug}`, { params });
    return response.data.available;
  } catch {
    // If endpoint doesn't exist, assume slug is available
    return true;
  }
}; 