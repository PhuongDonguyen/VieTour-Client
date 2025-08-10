import {
  createRegisterPartner,
  getRegisterPartners,
  getRegisterPartnerById,
  updateRegisterPartner,
  approveRegisterPartner,
  rejectRegisterPartner,
  type RegisterPartnerRequest,
  type RegisterPartnerUpdateRequest,
} from "@/apis/registerPartner.api";

export const registerPartnerService = {
  // Tạo yêu cầu đăng ký đối tác
  createRegisterPartner: async (data: RegisterPartnerRequest) => {
    try {
      const response = await createRegisterPartner(data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách yêu cầu đăng ký đối tác
  getRegisterPartners: async (params?: {
    status?: "pending" | "accept" | "decline";
    page?: number;
    limit?: number;
  }) => {
    try {
      const response = await getRegisterPartners(params);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Lấy chi tiết yêu cầu đăng ký đối tác
  getRegisterPartnerById: async (id: number) => {
    try {
      const response = await getRegisterPartnerById(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Cập nhật yêu cầu đăng ký đối tác
  updateRegisterPartner: async (
    id: number,
    data: RegisterPartnerUpdateRequest
  ) => {
    try {
      const response = await updateRegisterPartner(id, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Phê duyệt yêu cầu đăng ký đối tác
  approveRegisterPartner: async (id: number) => {
    try {
      const response = await approveRegisterPartner(id);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Từ chối yêu cầu đăng ký đối tác
  rejectRegisterPartner: async (id: number, reason?: string) => {
    try {
      const response = await rejectRegisterPartner(id, reason);
      return response;
    } catch (error) {
      throw error;
    }
  },
};
