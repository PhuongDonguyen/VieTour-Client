import {
  createGeneralQuestionApi,
  deleteGeneralQuestionApi,
  fetchGeneralQuestionByIdApi,
  fetchGeneralQuestionsApi,
  updateGeneralQuestionApi,
  type FetchGeneralQuestionsParams,
  type GeneralQuestion,
} from "@/apis/generalQuestion.api";

export const fetchGeneralQuestions = async (
  params: FetchGeneralQuestionsParams
) => {
  const res = await fetchGeneralQuestionsApi(params);
  if (res.data && res.data.success) {
    return res.data;
  }
  throw new Error("Không thể tải danh sách câu hỏi thường gặp");
};

export const fetchGeneralQuestionById = async (id: number) => {
  const res = await fetchGeneralQuestionByIdApi(id);
  if (res.data && res.data.success) {
    return res.data.data;
  }
  throw new Error("Không thể tải câu hỏi thường gặp");
};

export const createGeneralQuestion = async (payload: {
  question: string;
  answer: string;
  tour_id: number;
}) => {
  const res = await createGeneralQuestionApi(payload);
  if (res.data && res.data.success) {
    return res.data.data;
  }
  throw new Error("Không thể tạo câu hỏi thường gặp");
};

export const updateGeneralQuestion = async (
  id: number,
  payload: Partial<Pick<GeneralQuestion, "question" | "answer" | "tour_id">>
) => {
  const res = await updateGeneralQuestionApi(id, payload);
  if (res.data && res.data.success) {
    return res.data.data;
  }
  throw new Error("Không thể cập nhật câu hỏi thường gặp");
};

export const deleteGeneralQuestion = async (id: number) => {
  const res = await deleteGeneralQuestionApi(id);
  if (res.data && res.data.success) {
    return res.data.data;
  }
  throw new Error("Không thể xóa câu hỏi thường gặp");
};
