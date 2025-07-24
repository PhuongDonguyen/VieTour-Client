import { createBooking, getMyBookings } from "../apis/booking.api";
import type { BookingRequest } from "../apis/booking.api";

export const bookingService = {
  async createBooking(bookingData: BookingRequest) {
    try {
      const response = await createBooking(bookingData);
      return response.data;
    } catch (error) {
      console.error("Error creating booking:", error);
      throw error;
    }
  },

};

export const fetchMyBookings = async() => {
  try {
    const response = await getMyBookings();
    return response.data;
  } catch (error) {
      console.error("Error get booking:", error);
      throw error;
  }
}