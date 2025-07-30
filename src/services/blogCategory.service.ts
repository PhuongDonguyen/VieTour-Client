import * as blogCategoryApi from '../apis/blogCategory.api';

import type {
  CreateBlogCategoryRequest,
  UpdateBlogCategoryRequest,
  BlogCategoryListResponse,
  BlogCategoryResponse,
  DeleteResponse
} from '../apis/blogCategory.api';

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

// Get all blog categories
export const getAllCategories = async (params?: any): Promise<BlogCategory[]> => {
  try {
    const response = await blogCategoryApi.getAllBlogCategories(params);
    return response.data;
  } catch (error) {
    console.error('Error fetching blog categories:', error);
    throw error;
  }
};

// Get blog category by ID
export const getCategoryById = async (id: number): Promise<BlogCategory> => {
  try {
    const response = await blogCategoryApi.getBlogCategoryById(id);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog category with ID ${id}:`, error);
    throw error;
  }
};

// Create a new blog category
export const createCategory = async (categoryData: CreateBlogCategoryRequest): Promise<BlogCategory> => {
  try {
    const response = await blogCategoryApi.createBlogCategory(categoryData);
    return response.data;
  } catch (error) {
    console.error('Error creating blog category:', error);
    throw error;
  }
};

// Update an existing blog category
export const updateCategory = async (id: number, categoryData: UpdateBlogCategoryRequest): Promise<BlogCategory> => {
  try {
    const response = await blogCategoryApi.updateBlogCategory(id, categoryData);
    return response.data;
  } catch (error) {
    console.error(`Error updating blog category with ID ${id}:`, error);
    throw error;
  }
};

// Delete a blog category
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await blogCategoryApi.deleteBlogCategory(id);
  } catch (error) {
    console.error(`Error deleting blog category with ID ${id}:`, error);
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

// Validate slug format
export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
};

// Format category for display
export const formatCategoryForDisplay = (category: BlogCategory): BlogCategory & { displayName: string } => {
  return {
    ...category,
    displayName: `${category.title}${category.post_count !== undefined ? ` (${category.post_count})` : ''}`
  };
};
