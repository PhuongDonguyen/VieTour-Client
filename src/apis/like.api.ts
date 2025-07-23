import axiosInstance from "./axiosInstance";

export const userLike = (userId: number, reviewId: number) =>
    axiosInstance.post(`api/likes`,{userId, reviewId})

export const delLike = (userId: number, reviewId: number) =>
    axiosInstance.post(`api/likes`,{userId, reviewId})