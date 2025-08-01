import { getQuestionByTourId , submitQuestion, deleteQuestion, updateReported} from "../apis/question.api";

export const fetchQuestionsByTourId = async (tourId: number) => {
  const res = await getQuestionByTourId(tourId);
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