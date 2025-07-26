import { providerApi } from '../apis/provider.api';

// Provider service để xử lý logic nghiệp vụ
export const providerService = {
  // Tours management
  async getProviderTours() {
    try {
      const response = await providerApi.getTours();
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách tours thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách tours'
      };
    }
  },

  async createTour(tourData: any) {
    try {
      const response = await providerApi.createTour(tourData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo tour mới thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi tạo tour mới'
      };
    }
  },

  // Tour prices management
  async getTourPrices() {
    try {
      const response = await providerApi.getTourPrices();
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách giá tours thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi lấy danh sách giá tours'
      };
    }
  },

  async updateTourPrice(id: string, priceData: any) {
    try {
      const response = await providerApi.updateTourPrice(id, priceData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật giá tour thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi cập nhật giá tour'
      };
    }
  },

  // Tour schedules management
  async getTourSchedules() {
    try {
      const response = await providerApi.getTourSchedules();
      return {
        success: true,
        data: response.data,
        message: 'Lấy lịch trình tours thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi lấy lịch trình tours'
      };
    }
  },

  async createTourSchedule(scheduleData: any) {
    try {
      const response = await providerApi.createTourSchedule(scheduleData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo lịch trình thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi tạo lịch trình'
      };
    }
  },

  // Tour images management
  async getTourImages() {
    try {
      const response = await providerApi.getTourImages();
      return {
        success: true,
        data: response.data,
        message: 'Lấy hình ảnh tours thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi lấy hình ảnh tours'
      };
    }
  },

  async uploadTourImage(file: File, tourId: string) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('tourId', tourId);
      
      const response = await providerApi.uploadTourImage(formData);
      return {
        success: true,
        data: response.data,
        message: 'Upload hình ảnh thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi upload hình ảnh'
      };
    }
  },

  // Tour details management
  async getTourDetails() {
    try {
      const response = await providerApi.getTourDetails();
      return {
        success: true,
        data: response.data,
        message: 'Lấy chi tiết tours thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi lấy chi tiết tours'
      };
    }
  },

  // Tour categories management
  async getTourCategories() {
    try {
      const response = await providerApi.getTourCategories();
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh mục tours thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi lấy danh mục tours'
      };
    }
  },

  // Price overrides management
  async getPriceOverrides() {
    try {
      const response = await providerApi.getTourPriceOverrides();
      return {
        success: true,
        data: response.data,
        message: 'Lấy giá đặc biệt thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi lấy giá đặc biệt'
      };
    }
  },

  async createPriceOverride(overrideData: any) {
    try {
      const response = await providerApi.createPriceOverride(overrideData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo giá đặc biệt thành công'
      };
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Lỗi khi tạo giá đặc biệt'
      };
    }
  },
};
