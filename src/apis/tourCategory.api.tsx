export const TOUR_CATEGORY_API = {
  LIST: 'http://localhost:8000/api/tour-categories',
}; 

import axiosInstance from './axiosInstance';

export const getTourCategoryBySlug = (slug: string) => 
  axiosInstance.get(`/api/tour-categories?slug=${slug}`);