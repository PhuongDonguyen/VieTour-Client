import { getReviewByTourId, createReview } from "../apis/review.api";

export const fetchReviewByTourId = async (tourId: number) => {
  const res = await getReviewByTourId(tourId);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không load được review");
};

export const submitReview = async (
  userId: number,
  tourId: number,
  tourStar: number,
  text: string
) => {
  const res = await createReview(userId, tourId, tourStar, text);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không gửi được đánh giá");
};
