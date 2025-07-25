import axiosInstance from './axiosInstance';

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
  axiosInstance.post('/api/bookings', bookingData);

export const getMyBookings = () =>
  axiosInstance.get('/api/bookings');
