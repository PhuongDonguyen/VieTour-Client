import { getAllBlogCategories } from '../apis/blogCategory.api';

export const fetchBlogCategories = async () => {
  return await getAllBlogCategories();
}; 