import { getTourCategoryBySlug } from '../apis/tourCategory.api';

import { getTourCategories} from '../apis/tourCategory.api';

export const fetchActiveTourCategories = async () => {
  const response = await getTourCategories();
  if (response.data && response.data.success) {
    return response.data.data.filter((cat: any) => cat.is_active);
  }
  throw new Error('Failed to fetch tour categories');
}; 

export const getTourCategoriesBySlug = async (slug: string) => {
  const res = await getTourCategoryBySlug(slug);
  if (res.data && res.data.success) return res.data;
    throw new Error("Không tìm thấy tour categories");
  
}
