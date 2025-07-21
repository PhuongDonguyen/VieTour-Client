import axiosInstance from "./axiosInstance";

export const getQuestionByTourId = (tourId: number)  => 
    axiosInstance.get( `/api/questions/tour/${tourId}`)