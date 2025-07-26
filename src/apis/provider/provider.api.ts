import axiosInstance from '../axiosInstance';

// Provider tour data API endpoints
export const providerApi = {
  // Danh sách tours của provider
  getTours: () => axiosInstance.get('/api/provider/tours'),
  
  // Giá tours của provider
  getTourPrices: () => axiosInstance.get('/api/provider/tour-prices'),
  
  // Lịch trình tours
  getTourSchedules: () => axiosInstance.get('/api/provider/tour-schedules'),
  
  // Hình ảnh tours
  getTourImages: () => axiosInstance.get('/api/provider/tour-images'),
  
  // Chi tiết tours
  getTourDetails: () => axiosInstance.get('/api/provider/tour-details'),
  
  // Danh mục tours
  getTourCategories: () => axiosInstance.get('/api/provider/tour-categories'),
  
  // Giá đặc biệt
  getTourPriceOverrides: () => axiosInstance.get('/api/provider/tour-price-overrides'),

  // Additional CRUD operations
  createTour: (data: any) => axiosInstance.post('/api/provider/tours', data),
  updateTour: (id: string, data: any) => axiosInstance.put(`/api/provider/tours/${id}`, data),
  deleteTour: (id: string) => axiosInstance.delete(`/api/provider/tours/${id}`),
  
  createTourPrice: (data: any) => axiosInstance.post('/api/provider/tour-prices', data),
  updateTourPrice: (id: string, data: any) => axiosInstance.put(`/api/provider/tour-prices/${id}`, data),
  deleteTourPrice: (id: string) => axiosInstance.delete(`/api/provider/tour-prices/${id}`),
  
  createTourSchedule: (data: any) => axiosInstance.post('/api/provider/tour-schedules', data),
  updateTourSchedule: (id: string, data: any) => axiosInstance.put(`/api/provider/tour-schedules/${id}`, data),
  deleteTourSchedule: (id: string) => axiosInstance.delete(`/api/provider/tour-schedules/${id}`),
  
  uploadTourImage: (formData: FormData) => axiosInstance.post('/api/provider/tour-images', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteTourImage: (id: string) => axiosInstance.delete(`/api/provider/tour-images/${id}`),
  
  updateTourDetail: (id: string, data: any) => axiosInstance.put(`/api/provider/tour-details/${id}`, data),
  
  createPriceOverride: (data: any) => axiosInstance.post('/api/provider/tour-price-overrides', data),
  updatePriceOverride: (id: string, data: any) => axiosInstance.put(`/api/provider/tour-price-overrides/${id}`, data),
  deletePriceOverride: (id: string) => axiosInstance.delete(`/api/provider/tour-price-overrides/${id}`),
};
