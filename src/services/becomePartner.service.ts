import {
  createBecomePartner,
  getBecomePartners,
  getBecomePartnerById,
  updateBecomePartner,
  updateBecomePartnerStatus,
  type BecomePartnerRequest,
  type BecomePartnerUpdateRequest,
  type BecomePartnerStatusRequest,
} from "@/apis/becomePartner.api";

export const becomePartnerService = {
  // Tạo yêu cầu trở thành đối tác (Public)
  createBecomePartner: async (data: BecomePartnerRequest) => {
    try {
      const response = await createBecomePartner(data);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Lấy danh sách yêu cầu (Admin only)
  getBecomePartners: async (params?: {
    status?: "pending" | "approved" | "rejected";
    page?: number;
    limit?: number;
  }) => {
    try {
      const response = await getBecomePartners(params);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Lấy chi tiết yêu cầu (Admin only)
  getBecomePartnerById: async (id: number) => {
    try {
      const response = await getBecomePartnerById(id);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Cập nhật yêu cầu (Admin only)
  updateBecomePartner: async (id: number, data: BecomePartnerUpdateRequest) => {
    try {
      const response = await updateBecomePartner(id, data);
      return response;
    } catch (error: any) {
      throw error;
    }
  },

  // Cập nhật status (Admin only)
  updateBecomePartnerStatus: async (id: number, data: BecomePartnerStatusRequest) => {
    try {
      const response = await updateBecomePartnerStatus(id, data);
      return response;
    } catch (error: any) {
      throw error;
    }
  },
};
