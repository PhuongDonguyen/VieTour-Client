import { userLike , delLike,getLike} from "../apis/like.api";

export const userLikeReview = async (userId: number, reviewId: number) => {
  const res = await userLike(userId, reviewId);
  if (res.data) return res.data;
  throw new Error("like fail");
};

export const deleteLike = async(id: number) => {
  const res = await delLike(id);
  if (res.data && res.data.success) return res.data;
  throw new Error("delete like fail");
};

export const getLikesByUserIdAndReviewId = async (userId: number, reviewId: number) => {
  const res = await getLike(userId, reviewId);
  if (res.data) return res.data;
  throw new Error("like fail");
}