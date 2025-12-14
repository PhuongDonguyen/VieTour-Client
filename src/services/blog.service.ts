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
export const fetchBlogs = async (params?: BlogQueryParams): Promise<BlogResponse> => {
  try {
    const blogData = await blogApi.getAllBlogs(params);
    return blogData;
  } catch (error) {
    console.error('Error fetching blogs:', error);
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

// Fetch blogs for current user with like status
export const fetchUserBlogs = async (params?: BlogQueryParams): Promise<BlogResponse> => {
  try {
    const blogData = await blogApi.getUserBlogs(params);
    return blogData;
  } catch (error) {
    console.error('Error fetching user blogs:', error);
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

// Validate blog data
export const validateBlogData = (blogData: Partial<CreateBlogRequest>): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!blogData.title || blogData.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!blogData.content || blogData.content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (!blogData.excerpt || blogData.excerpt.trim().length === 0) {
    errors.push('Excerpt is required');
  }

  if (!blogData.slug || blogData.slug.trim().length === 0) {
    errors.push('Slug is required');
  } else if (!isValidSlug(blogData.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  if (!blogData.category_id) {
    errors.push('Category is required');
  }

  if (!blogData.author || blogData.author.trim().length === 0) {
    errors.push('Author is required');
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
    formattedDate: new Date(blog.created_at).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    readTime: Math.ceil(blog.content.split(' ').length / 200) // Rough estimate: 200 words per minute
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