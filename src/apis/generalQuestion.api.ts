import axiosInstance from "./axiosInstance";

export interface GeneralQuestionApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface GeneralQuestion {
  id: number;
  question: string;
  answer: string;
  tour_id: number;
  created_at?: string;
  updated_at?: string;
  tour?: {
    id: number;
    title: string;
    description?: string;
    poster_url?: string;
    tour_category?: { id: number; name: string };
  };
}

export interface FetchGeneralQuestionsParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  tour_id?: number;
}

export const fetchGeneralQuestionsApi = (params: FetchGeneralQuestionsParams) =>
  axiosInstance.get<GeneralQuestionApiResponse<GeneralQuestion[]>>(
    "/api/general-questions",
    { params }
  );

export const fetchGeneralQuestionByIdApi = (id: number) =>
  axiosInstance.get<GeneralQuestionApiResponse<GeneralQuestion>>(
    `/api/general-questions/${id}`
  );

export const createGeneralQuestionApi = (payload: {
  question: string;
  answer: string;
  tour_id: number;
}) =>
  axiosInstance.post<GeneralQuestionApiResponse<GeneralQuestion>>(
    "/api/general-questions",
    payload
  );

export const updateGeneralQuestionApi = (
  id: number,
  payload: Partial<{
    question: string;
    answer: string;
    tour_id: number;
  }>
) =>
  axiosInstance.put<GeneralQuestionApiResponse<GeneralQuestion>>(
    `/api/general-questions/${id}`,
    payload
  );

export const deleteGeneralQuestionApi = (id: number) =>
  axiosInstance.delete<GeneralQuestionApiResponse<{ message: string }>>(
    `/api/general-questions/${id}`
  );
