import axiosInstance from '../apis/axiosInstance';
import { TOUR_IMAGE_API } from '../apis/tourImage.api';
 
export const fetchTourImages = async (tour_id: number) => {
  const res = await axiosInstance.get(TOUR_IMAGE_API.LIST, { params: { tour_id } });
  if (res.data && res.data.success) return res.data.data;
  throw new Error('Không tìm thấy ảnh tour');
}; 