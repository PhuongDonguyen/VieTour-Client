import axiosInstance from "./axiosInstance";

export const userLike = (reviewId: number) =>
  axiosInstance.post(`api/likes`, { reviewId });

export const delLike = (id: number) => axiosInstance.delete(`api/likes/${id}`);

export const getLike = (reviewId: number) =>
  axiosInstance.get(`api/likes?reviewId=${reviewId}`);
