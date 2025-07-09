import axios from 'axios';
import { TOUR_CATEGORY_API } from '../apis/tourCategory.api';

export const fetchActiveTourCategories = async () => {
  const response = await axios.get(TOUR_CATEGORY_API.LIST);
  if (response.data && response.data.success) {
    return response.data.data.filter((cat: any) => cat.is_active);
  }
  throw new Error('Failed to fetch tour categories');
}; 