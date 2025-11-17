import { getQuestionByTourId , submitQuestion, deleteQuestion, updateReported, getToursQuestionByProviderId, getQuestionsByTourIdOfProvider, getQuestionsByTourIdWithPagination, getQuestionsTree} from "../apis/question.api";

export const fetchQuestionsByTourId = async (tourId: number) => {
  const res = await getQuestionByTourId(tourId);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không tìm thấy question");
};

export const fetchQuestionsByTourIdWithPagination = async (tourId: number, page: number, limit: number) => {
  const res = await getQuestionsByTourIdWithPagination(tourId, page, limit);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không tìm thấy question");
};

export const sendQuestion = async (
  user_id: number | null,
  tour_id: number,
  parent_question_id: number | null,
  text: string,
  reported: boolean
) => {
  const res = await submitQuestion(user_id, tour_id, parent_question_id, text, reported);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không tìm thấy question");
};

export const delQuestion = async(id: number) => {
  const res = await deleteQuestion(id);
    if (res.data && res.data.success) return res.data;
  throw new Error("Lỗi xóa question");
}

export const updateQuestionReported = async (reported: boolean, id: number) => {
  const res = await updateReported(reported, id);
  if (res.data && res.data.success) return res.data;
  throw new Error("Lỗi cập nhật trạng thái reported");
};

export const fetchToursQuestionByProviderId = async (page: number, limit: number) => {
  const res = await getToursQuestionByProviderId(page, limit);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không tìm thấy question");
};

export const fetchQuestionsByTourIdOfProvider = async (tourId: number, page: number, limit: number) => {
  const res = await getQuestionsByTourIdOfProvider(tourId, page, limit);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không tìm thấy question");
};

export const fetchQuestionsTree = async (questionId: number) => {
  const res = await getQuestionsTree(questionId);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không tìm thấy question");
};