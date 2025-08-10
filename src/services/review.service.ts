import {
  getReviewByTourId,
  createReview,
  createReviewWithImages,
} from "../apis/review.api";

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

export const submitReviewWithImages = async (
  userId: number,
  tourId: number,
  tourStar: number,
  text: string,
  images: File[]
) => {
  const formData = new FormData();
  formData.append("userId", userId.toString());
  formData.append("tourId", tourId.toString());
  formData.append("tourStar", tourStar.toString());
  formData.append("text", text);

  images.forEach((image, index) => {
    formData.append("images", image);
  });

  const res = await createReviewWithImages(formData);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không gửi được đánh giá với hình ảnh");
};
