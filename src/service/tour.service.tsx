import axios from 'axios';
import { TOUR_API } from '../api/tour.api';

export const fetchTopBookedTours = async (limit: number = 6) => {
  const response = await axios.get(TOUR_API.TOP_BOOKED, {
    params: { limit },
  });
  if (response.data.success) {
    return response.data.data;
  }
  throw new Error('Failed to fetch top booked tours');
}; 