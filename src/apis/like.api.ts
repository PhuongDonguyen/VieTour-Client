import axiosInstance from "./axiosInstance";

export const userLike = (reviewId: number) =>
  axiosInstance.post(`api/likes`, { reviewId });

export const delLike = (reviewId: number) =>
  axiosInstance.delete("/api/likes", {
    params: { reviewId }
  });


export const getLike = (reviewId: number) =>
  axiosInstance.get(`api/likes?reviewId=${reviewId}`);
