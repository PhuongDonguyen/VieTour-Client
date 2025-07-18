import { getTourDetailByTourId } from '../apis/tourDetail.api';

export const fetchTourDetail = async (tour_id: number) => {
  const res = await getTourDetailByTourId(tour_id);
  if (res.data && res.data.success) return res.data.data;
  throw new Error('Không tìm thấy lịch trình tour');
}; 