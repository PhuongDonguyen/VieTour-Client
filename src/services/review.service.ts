import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
  type ReviewQueryParams,
} from "../apis/review.api";

export interface ReviewResponse {
  success: boolean;
  data: any[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: {
    averageRating: number;
    totalReviews: number;
    ratingCounts: {
      "1": number;
      "2": number;
      "3": number;
      "4": number;
      "5": number;
    };
  };
}

export const fetchAllReviews = async (params?: ReviewQueryParams): Promise<ReviewResponse> => {
  try {
    const response = await getAllReviews(params);
    return response.data;
  } catch (error) {
    console.error("Error fetching all reviews:", error);
    throw error;
  }
};

export const fetchReviewById = async (id: number) => {
  try {
    const response = await getReviewById(id);
    return response.data;
  } catch (error) {
    console.error("Error fetching review by id:", error);
    throw error;
  }
};

// Create new review
export const submitReview = async (formData: FormData) => {
  try {
    formData.append("action", "create");
    const response = await createReview(formData);
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};

// Update existing review
export const updateReviewService = async (
  reviewId: number,
  formData: FormData
) => {
  try {
    formData.append("action", "update");
    formData.append("reviewId", reviewId.toString());
    const response = await createReview(formData);
    return response.data;
  } catch (error) {
    console.error("Error updating review:", error);
    throw error;
  }
};

// Delete review
export const deleteReviewService = async (reviewId: number) => {
  try {
    const formData = new FormData();
    formData.append("action", "delete");
    formData.append("reviewId", reviewId.toString());
    const response = await createReview(formData);
    return response.data;
  } catch (error) {
    console.error("Error deleting review:", error);
    throw error;
  }
};
