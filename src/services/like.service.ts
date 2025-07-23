import { userLike } from "../apis/like.api";

export const userLikeReview = async (userId: number, reviewId: number) => {
  const res = await userLike(userId, reviewId);
  if (res.data) return res.data;
  throw new Error("like fail");
};
