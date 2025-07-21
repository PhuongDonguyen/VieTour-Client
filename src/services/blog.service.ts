import axiosInstance from '../apis/axiosInstance';

export const fetchBlogs = async () => {
  const response = await axiosInstance.get('/api/blogs');
  return response.data;
}; 