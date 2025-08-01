import axiosInstance from "./axiosInstance";

export interface BookingDetail {
  adult_quanti: number;
  kid_quanti: number;
  adult_price: number;
  kid_price: number;
  note: string;
}

export interface BookingRequest {
  schedule_id: number;
  total: number;
  client_name: string;
  client_phone: string;
  note: string;
  payment_id: number;
  booking_details: BookingDetail[];
}

export const createBooking = (bookingData: BookingRequest) =>
  axiosInstance.post("/api/bookings", bookingData);

export const getMyBookings = (page: number = 1, limit: number = 5, status?: string) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status && status !== "all") {
    params.append("status", status);
  }
  
  return axiosInstance.get(`/api/bookings/my-bookings?${params.toString()}`);
};

export const getBookingById = (id: number) =>
  axiosInstance.get(`/api/bookings/${id}`);

export const updateBookingStatus = (id: number, status: string) =>
  axiosInstance.put(`/api/bookings/${id}/status`, { status });
