import { getTourCategories, getTourCategoryBySlug } from '../apis/tourCategory.api';

export const fetchActiveTourCategories = async () => {
  const response = await getTourCategories();
  if (response.data && response.data.success) {
    return response.data.data.filter((cat: any) => cat.is_active);
  }
  throw new Error('Failed to fetch tour categories');
};

export const tourCategoryService = {
  async getAllTourCategories() {
    try {
      const response = await getTourCategories();
      return response;
    } catch (error) {
      console.error('Error fetching tour categories:', error);
      throw error;
    }
  },
  async getTourCategoryBySlug(slug: string) {
    try {
      const response = await getTourCategoryBySlug(slug);
      return response;
    } catch (error) {
      throw error;
    }
  }
}; 