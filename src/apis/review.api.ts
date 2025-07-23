import axiosInstance from "./axiosInstance";

export const getReviewByTourId = (tourId: number) => 
    axiosInstance.get(`/api/reviews?tour_id=${tourId}`)