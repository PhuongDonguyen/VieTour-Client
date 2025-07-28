import { getTourImagesByTourId, getTourImagesLimit } from '../apis/tourImage.api';

export const fetchTourImages = async (tour_id: number) => {
  const res = await getTourImagesByTourId(tour_id);
  if (res.data && res.data.success) return res.data.data;
  throw new Error('Không tìm thấy ảnh tour');
}; 

export const fetchTourImagesLimit = async (page: number, limit: number) => {
  const res = await getTourImagesLimit(page, limit);
  if (res.data && res.data.success) return res.data.data;
  throw new Error('Không tìm thấy ảnh tour');
};