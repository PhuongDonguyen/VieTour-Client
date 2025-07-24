import axiosInstance from "./axiosInstance";

export const userLike = (userId: number, reviewId: number) =>
    axiosInstance.post(`api/likes`,{userId, reviewId})

export const delLike = (id: number) =>
    axiosInstance.delete(`api/likes/${id}`)

export const getLike = (userId: number, reviewId: number) =>
    axiosInstance.get(`api/likes?userId=${userId}&reviewId=${reviewId}`)