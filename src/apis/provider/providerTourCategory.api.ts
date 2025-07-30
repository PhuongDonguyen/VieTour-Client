import axiosInstance from "../axiosInstance";

export interface ProviderTourCategory {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const providerTourCategoryApi = {
  // Lấy danh sách tất cả category
  async getCategories(): Promise<ProviderTourCategory[]> {
    try {
      const res = await axiosInstance.get("/api/provider/tour-categories");
      console.log("API raw response in getCategories:", res.data);
      // Giả định API trả về { success, data }
      return res.data.data || [];
    } catch (err) {
      console.error("Error in getCategories:", err);
      return [];
    }
  },

  // Lấy chi tiết category theo id
  async getCategoryById(id: number): Promise<ProviderTourCategory> {
    const res = await axiosInstance.get(`/api/provider/tour-categories/${id}`);
    return res.data.data;
  },
};
