import axiosInstance from '../axiosInstance';

// Tour Prices API
export interface TourPrice {
  id: number;
  tour_id: number;
  price_type: string;
  base_price: number;
  discount_price?: number;
  currency: string;
  is_active: boolean;
  valid_from: string;
  valid_to: string;
  tour?: {
    id: number;
    title: string;
  };
}

export interface TourPricesResponse {
  success: boolean;
  data: TourPrice[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export const providerTourPricesApi = {
  // Lấy danh sách giá tours
  getTourPrices: (): Promise<TourPricesResponse> => {
    return axiosInstance.get('/api/provider/tour-prices');
  },

  // Tạo giá mới
  createTourPrice: (priceData: Partial<TourPrice>) => {
    return axiosInstance.post('/api/provider/tour-prices', priceData);
  },

  // Cập nhật giá
  updateTourPrice: (id: number, priceData: Partial<TourPrice>) => {
    return axiosInstance.put(`/api/provider/tour-prices/${id}`, priceData);
  },

  // Xóa giá
  deleteTourPrice: (id: number) => {
    return axiosInstance.delete(`/api/provider/tour-prices/${id}`);
  },

  // Lấy giá theo tour ID
  getPricesByTourId: (tourId: number) => {
    return axiosInstance.get(`/api/provider/tour-prices/tour/${tourId}`);
  }
};

// Tour Schedules API
export interface TourSchedule {
  id: number;
  tour_id: number;
  day_number: number;
  title: string;
  description: string;
  location?: string;
  start_time?: string;
  end_time?: string;
  activities: string[];
}

export const providerTourSchedulesApi = {
  getTourSchedules: () => {
    return axiosInstance.get('/api/provider/tour-schedules');
  },

  createTourSchedule: (scheduleData: Partial<TourSchedule>) => {
    return axiosInstance.post('/api/provider/tour-schedules', scheduleData);
  },

  updateTourSchedule: (id: number, scheduleData: Partial<TourSchedule>) => {
    return axiosInstance.put(`/api/provider/tour-schedules/${id}`, scheduleData);
  },

  deleteTourSchedule: (id: number) => {
    return axiosInstance.delete(`/api/provider/tour-schedules/${id}`);
  },

  getSchedulesByTourId: (tourId: number) => {
    return axiosInstance.get(`/api/provider/tour-schedules/tour/${tourId}`);
  }
};

// Tour Images API
export interface TourImage {
  id: number;
  tour_id: number;
  image_url: string;
  caption?: string;
  is_primary: boolean;
  display_order: number;
}

export const providerTourImagesApi = {
  getTourImages: () => {
    return axiosInstance.get('/api/provider/tour-images');
  },

  uploadTourImage: (tourId: number, imageFile: File, caption?: string) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('tour_id', tourId.toString());
    if (caption) formData.append('caption', caption);

    return axiosInstance.post('/api/provider/tour-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateTourImage: (id: number, imageData: Partial<TourImage>) => {
    return axiosInstance.put(`/api/provider/tour-images/${id}`, imageData);
  },

  deleteTourImage: (id: number) => {
    return axiosInstance.delete(`/api/provider/tour-images/${id}`);
  },

  getImagesByTourId: (tourId: number) => {
    return axiosInstance.get(`/api/provider/tour-images/tour/${tourId}`);
  }
};

// Tour Details API
export interface TourDetail {
  id: number;
  tour_id: number;
  detail_type: string;
  content: string;
  display_order: number;
}

export const providerTourDetailsApi = {
  getTourDetails: () => {
    return axiosInstance.get('/api/provider/tour-details');
  },

  createTourDetail: (detailData: Partial<TourDetail>) => {
    return axiosInstance.post('/api/provider/tour-details', detailData);
  },

  updateTourDetail: (id: number, detailData: Partial<TourDetail>) => {
    return axiosInstance.put(`/api/provider/tour-details/${id}`, detailData);
  },

  deleteTourDetail: (id: number) => {
    return axiosInstance.delete(`/api/provider/tour-details/${id}`);
  },

  getDetailsByTourId: (tourId: number) => {
    return axiosInstance.get(`/api/provider/tour-details/tour/${tourId}`);
  }
};

// Tour Categories API
export interface TourCategory {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

export const providerTourCategoriesApi = {
  getTourCategories: () => {
    return axiosInstance.get('/api/provider/tour-categories');
  },

  createTourCategory: (categoryData: Partial<TourCategory>) => {
    return axiosInstance.post('/api/provider/tour-categories', categoryData);
  },

  updateTourCategory: (id: number, categoryData: Partial<TourCategory>) => {
    return axiosInstance.put(`/api/provider/tour-categories/${id}`, categoryData);
  },

  deleteTourCategory: (id: number) => {
    return axiosInstance.delete(`/api/provider/tour-categories/${id}`);
  }
};

// Tour Price Overrides API
export interface TourPriceOverride {
  id: number;
  tour_id: number;
  price_type: string;
  override_price: number;
  reason: string;
  valid_from: string;
  valid_to: string;
  is_active: boolean;
}

export const providerTourPriceOverridesApi = {
  getTourPriceOverrides: () => {
    return axiosInstance.get('/api/provider/tour-price-overrides');
  },

  createTourPriceOverride: (overrideData: Partial<TourPriceOverride>) => {
    return axiosInstance.post('/api/provider/tour-price-overrides', overrideData);
  },

  updateTourPriceOverride: (id: number, overrideData: Partial<TourPriceOverride>) => {
    return axiosInstance.put(`/api/provider/tour-price-overrides/${id}`, overrideData);
  },

  deleteTourPriceOverride: (id: number) => {
    return axiosInstance.delete(`/api/provider/tour-price-overrides/${id}`);
  },

  getOverridesByTourId: (tourId: number) => {
    return axiosInstance.get(`/api/provider/tour-price-overrides/tour/${tourId}`);
  }
};
