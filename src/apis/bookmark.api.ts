import axiosInstance from './axiosInstance';
import type { BlogPost, BlogResponse, BlogQueryParams } from './blog.api';

// Re-export BlogPost để dễ sử dụng
export type { BlogPost, BlogResponse, BlogQueryParams } from './blog.api';

export interface ToggleBookmarkResponse {
  success: boolean;
  message?: string;
  // Có thể backend trả thêm data chi tiết, để any cho linh hoạt
  data?: any;
}

// Toggle bookmark cho blog theo blog_id
export const toggleBlogBookmark = async (blogId: number | string): Promise<ToggleBookmarkResponse> => {
  const response = await axiosInstance.post('/api/blog-bookmarks/toggle', {
    blog_id: blogId
  });
  return response.data;
};

// Lấy danh sách blog đã bookmark của user
export const getUserBookmarkedBlogs = async (params?: BlogQueryParams): Promise<BlogResponse> => {
  const response = await axiosInstance.get('/api/blog-bookmarks/user/blogs', { params });
  return response.data;
};


