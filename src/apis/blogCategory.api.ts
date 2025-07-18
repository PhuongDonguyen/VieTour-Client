import axiosInstance from './axiosInstance';

export const getAllBlogCategories = async () => {
  const response = await axiosInstance.get('/api/blog-categories');
  return response.data;
}; 