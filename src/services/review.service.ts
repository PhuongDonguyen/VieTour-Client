import { getReviewByTourId } from "../apis/review.api";

export const fetchReviewByTourId = async (tourId: number) => {
  const res = await getReviewByTourId(tourId);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không load được review");
};
