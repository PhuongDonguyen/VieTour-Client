import axiosInstance from '../apis/axiosInstance';
import { TOUR_API } from '../apis/tour.api';

export const fetchTourBySlug = async (slug: string) => {
  const res = await axiosInstance.get(TOUR_API.GET_BY_SLUG, { params: { slug } });
  if (res.data && res.data.success) return res.data.data;
  throw new Error('Không tìm thấy tour');
};

export const fetchTourDetail = async (tour_id: number) => {
  const res = await axiosInstance.get(TOUR_API.DETAIL, { params: { tour_id } });
  if (res.data && res.data.success) return res.data.data;
  throw new Error('Không tìm thấy lịch trình tour');
};

export const fetchTourImages = async (tour_id: number) => {
  const res = await axiosInstance.get(TOUR_API.IMAGES, { params: { tour_id } });
  if (res.data && res.data.success) return res.data.data;
  throw new Error('Không tìm thấy ảnh tour');
};

export const fetchTopBookedTours = async (limit: number = 10) => {
  const res = await axiosInstance.get(TOUR_API.TOP_BOOKED, { params: { limit } });
  if (res.data && res.data.success) return res.data.data;
  throw new Error('Không lấy được tour nổi bật');
}; 