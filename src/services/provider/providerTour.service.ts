import { providerTourApi } from "../../apis/provider/providerTour.api";
import type { ProviderTour } from "../../apis/provider/providerTour.api";

export interface TourFilters {
  page?: number;
  limit?: number;
  search?: string;
  // category?: string;
  status?: string;
  tour_category_id?: number;
}

export const providerTourService = {
  // Lấy danh sách tours với filter
  async getTours(filters?: TourFilters): Promise<any> {
    try {
      // Truyền đúng tour_category_id cho API
      const response = await providerTourApi.getProviderTours(filters);
      console.log("Raw API response:", response); // Debug log

      // Axios response có data property
      const apiData = response.data || response;
      console.log("Processed API data:", apiData); // Debug log

      return apiData;
    } catch (error) {
      console.error("Error fetching provider tours:", error);
      throw error;
    }
  },

  // Tạo tour mới
  async createTour(tourData: FormData): Promise<ProviderTour> {
    try {
      const response = await providerTourApi.createTour(tourData);
      return response.data;
    } catch (error) {
      console.error("Error creating tour:", error);
      throw error;
    }
  },

  // Cập nhật tour
  async updateTour(id: number, tourData: FormData): Promise<ProviderTour> {
    try {
      const response = await providerTourApi.updateTour(id, tourData);
      return response.data;
    } catch (error) {
      console.error("Error updating tour:", error);
      throw error;
    }
  },

  // Xóa tour
  async deleteTour(id: number): Promise<void> {
    try {
      await providerTourApi.deleteTour(id);
    } catch (error) {
      console.error("Error deleting tour:", error);
      throw error;
    }
  },

  // Lấy chi tiết tour
  async getTourById(id: number): Promise<ProviderTour> {
    try {
      const response = await providerTourApi.getTourById(id);
      return response.data;
    } catch (error) {
      console.error("Error fetching tour details:", error);
      throw error;
    }
  },

  // Thay đổi trạng thái tour
  async toggleTourStatus(id: number): Promise<ProviderTour> {
    try {
      const response = await providerTourApi.toggleTourStatus(id);
      return response.data;
    } catch (error) {
      console.error("Error toggling tour status:", error);
      throw error;
    }
  },

  // Tăng view count tour
  async incrementViewCount(id: number): Promise<ProviderTour> {
    try {
      const response = await providerTourApi.incrementViewCount(id);
      return response.data;
    } catch (error) {
      console.error("Error incrementing view count:", error);
      throw error;
    }
  },

  // Format dữ liệu tour để hiển thị
  formatTourForDisplay(tour: ProviderTour) {
    return {
      ...tour,
      formattedViewCount: parseInt(tour.view_count).toLocaleString(),
      statusText: tour.is_active ? "Hoạt động" : "Không hoạt động",
      statusColor: tour.is_active ? "text-green-600" : "text-red-600",
      ratingDisplay:
        tour.total_star > 0
          ? `${tour.total_star}/5 (${tour.review_count} đánh giá)`
          : "Chưa có đánh giá",
    };
  },
};
