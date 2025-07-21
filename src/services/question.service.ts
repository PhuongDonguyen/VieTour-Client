import { getQuestionByTourId } from "../apis/question.api";

export const fetchQuestionByTuorId = async(tourId: number) => {
    const res = await getQuestionByTourId(tourId);
      if (res.data && res.data.success) return res.data;
  throw new Error("Không tìm thấy question");
} 