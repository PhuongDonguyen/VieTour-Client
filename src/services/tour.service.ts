import {
  getTourBySlug,
  getTourDetail,
  getTourImages,
  getTopBookedTours,
  getTours,
  getToursByCatId,
  getToursByIsActive,
} from "../apis/tour.api";

export const fetchTourBySlug = async (slug: string) => {
  const res = await getTourBySlug(slug);
  if (res.data && res.data.success) return res.data.data;
  throw new Error("Không tìm thấy tour");
};

export const fetchTourDetail = async (tour_id: number) => {
  const res = await getTourDetail(tour_id);
  if (res.data && res.data.success) return res.data.data;
  throw new Error("Không tìm thấy lịch trình tour");
};

export const fetchTourImages = async (tour_id: number) => {
  const res = await getTourImages(tour_id);
  if (res.data && res.data.success) return res.data.data;
  throw new Error("Không tìm thấy ảnh tour");
};

export const fetchTopBookedTours = async (limit: number = 10) => {
  const res = await getTopBookedTours(limit);
  if (res.data && res.data.success) return res.data.data;
  throw new Error("Không lấy được tour nổi bật");
};

export const fetchTours = async (page: number, limit: number) => {
  const res = await getTours(page, limit);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không lấy được tour");
};

export const fetchToursByCategoryId = async (categoryId: number) =>{
  const res = await getToursByCatId(categoryId);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không lấy được tour theo category");
};

export const fetchTourIsActive = async (is_active: boolean) => {
    const res = await getToursByIsActive(is_active);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không lấy được tour theo category");
};

