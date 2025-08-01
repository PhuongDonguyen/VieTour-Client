import axiosInstance from "./axiosInstance";

export const getQuestionByTourId = (tourId: number)  => 
    axiosInstance.get( `/api/questions?tourId=${tourId}`)

export const submitQuestion = (user_id: number|null, tour_id: number, parent_question_id: number| null, text: string, reported: boolean) =>
    axiosInstance.post(`/api/questions`,{user_id, tour_id, parent_question_id, text, reported})

export const deleteQuestion = (id: number) => 
    axiosInstance.delete(`/api/questions/${id}`)

export const updateReported = (reported: boolean, id: number) =>
    axiosInstance.put(`/api/questions/${id}`, {reported})