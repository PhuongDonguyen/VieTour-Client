import axiosInstance from '../apis/axiosInstance';
import { TOUR_DETAIL_API } from '../apis/tourDetail.api';

export const fetchTourDetail = async (tour_id: number) => {
  const res = await axiosInstance.get(TOUR_DETAIL_API.LIST, { params: { tour_id } });
  if (res.data && res.data.success) return res.data.data;
  throw new Error('Không tìm thấy lịch trình tour');
}; 