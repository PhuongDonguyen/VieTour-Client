import axiosInstance from "./axiosInstance";

export interface RefundRate {
  id: number;
  from_day: number;
  to_day: number;
  refund_percentage: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getRefundRates = async () => {
  return axiosInstance.get("/api/refund-rates");
};

export const getActiveRefundRates = async () => {
  return axiosInstance.get("/api/refund-rates/active");
};

export const getRefundRateById = async (id: number) => {
  return axiosInstance.get(`/api/refund-rates/${id}`);
};

export const calculateRefundRate = async (daysBeforeDeparture: number) => {
  return axiosInstance.post("/api/refund-rates/calculate", {
    daysBeforeDeparture,
  });
};
