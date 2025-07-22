import { getQuestionByTourId , submitQuestion} from "../apis/question.api";

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
