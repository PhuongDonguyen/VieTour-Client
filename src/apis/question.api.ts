import axiosInstance from "./axiosInstance";

export const getQuestionByTourId = (tourId: number)  => 
    axiosInstance.get( `/api/questions/tour/${tourId}`)

export const submitQuestion = (tour_id: number, user_id: number, parent_question_id: number| null, text: string, reported: boolean) =>
    axiosInstance.post(`/api/questions`,{user_id, tour_id, parent_question_id, text, reported})
