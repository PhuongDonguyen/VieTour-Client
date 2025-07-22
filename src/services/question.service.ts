import { getQuestionByTourId , submitQuestion, deleteQuestion} from "../apis/question.api";

export const fetchQuestionByTuorId = async (tourId: number) => {
  const res = await getQuestionByTourId(tourId);
  if (res.data && res.data.success) return res.data;
  throw new Error("Không tìm thấy question");
};

export const sendQuestion = async (
  tour_id: number,
  user_id: number,
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
