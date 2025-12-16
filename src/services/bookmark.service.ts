import * as bookmarkApi from '../apis/bookmark.api';

import type { ToggleBookmarkResponse } from '../apis/bookmark.api';
import type { BlogResponse, BlogQueryParams } from '../apis/blog.api';

// Service toggle bookmark cho blog
export const toggleBlogBookmark = async (blogId: number): Promise<ToggleBookmarkResponse> => {
  try {
    const response = await bookmarkApi.toggleBlogBookmark(blogId);
    return response;
  } catch (error) {
    console.error('Error toggling blog bookmark:', error);
    throw error;
  }
};

// Service lấy danh sách blog đã bookmark của user
export const getUserBookmarkedBlogs = async (params?: BlogQueryParams): Promise<BlogResponse> => {
  try {
    const response = await bookmarkApi.getUserBookmarkedBlogs(params);
    return response;
  } catch (error) {
    console.error('Error fetching user bookmarked blogs:', error);
    throw error;
  }
};


