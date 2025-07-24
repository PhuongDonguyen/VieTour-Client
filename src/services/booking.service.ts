import { createBooking, getMyBookings } from "../apis/booking.api";
import type { BookingRequest } from "../apis/booking.api";  
import { getTourScheduleById } from "@/apis/tourSchedule.api";
import {getTourById} from '../apis/tour.api'

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


export const fetchMyBookings = async () => {
  try {
    const resBooking = await getMyBookings();
    const bookings = resBooking.data.data; // Đây là mảng

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking: any) => {
        const resSchedule = await getTourScheduleById(booking.schedule_id);
        const schedule = resSchedule.data.data;

        const resTour = await getTourById(schedule.tour_id);
        const tour = resTour.data.data;

        return {
          ...booking,
          schedule: {
            ...schedule,
            tour: { ...tour },
          },
        };
      })
    );

    return { bookings: enrichedBookings };
  } catch (error) {
    console.error("Lỗi khi lấy danh sách booking:", error);
    throw error;
  }
};

