import { userLike, delLike, getLike } from "../apis/like.api";

export const userLikeReview = async (reviewId: number) => {
  const res = await userLike(reviewId);
  if (res.data) return res.data;
  throw new Error("like fail");
};

export const deleteLike = async (reviewId: number) => {
  const res = await delLike(reviewId);
  if (res.data && res.data.success) return res.data;
  throw new Error("delete like fail");
};

export const getLikesByUserIdAndReviewId = async (reviewId: number) => {
  const res = await getLike(reviewId);
  if (res.data) return res.data;
  throw new Error("like fail");
};
