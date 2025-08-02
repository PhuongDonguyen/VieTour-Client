import React, { useEffect, useState, useRef } from "react";
import { Star, Heart, MessageCircle, Clock } from "lucide-react";
import { fetchReviewByTourId } from "../../services/review.service";
import { Loading } from "../Loading";
import {
  fetchUserById,
  fetchUserProfile,
} from "../../services/userProfile.service";
import {
  deleteLike,
  getLikesByUserIdAndReviewId,
  userLikeReview,
} from "../../services/like.service";

interface Review {
  id: number;
  user_id: number;
  tour_id: number;
  tour_star: number;
  text: string;
  like_count: number;
  created_at: string;
  user: User;
  user_like_id: number | null;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  avatar: string;
}

interface ReviewListProps {
  tourId: number;
  totalStar: number;
  reviewCount: number;
}

export const TabReview: React.FC<ReviewListProps> = ({
  tourId,
  totalStar,
  reviewCount,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const userCurrent = useRef<User | null>(null);
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    }

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  useEffect(() => {
    const loadUserCurrent = async () => {
      try {
        const res = await fetchUserProfile();
        console.log("user cur: ", res.data);
        const data = res.data;
        userCurrent.current = {
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar: data.avatar,
        };
      } catch (error) {
        console.log("Lỗi tải user current");
      }
    };
    loadUserCurrent();
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const handleToggleLike = async (reviewId: number) => {
    if (!userCurrent.current) {
      console.log("User current: ", userCurrent.current);
      alert("Cần đăng nhập khi like");
      return;
    }
    setReviews((prevReviews) =>
      prevReviews.map((review) => {
        if (review.id === reviewId) {
          const isLiked = review.user_like_id !== null;

          return {
            ...review,
            user_like_id: isLiked ? null : 1, // 1 là giả lập user_like_id khi đã like
            like_count: isLiked ? review.like_count - 1 : review.like_count + 1,
          };
        }
        return review;
      })
    );

    try {
      const review = reviews.find((r) => r.id === reviewId);
      if (review?.user_like_id !== null) {
        await deleteLike(review!.user_like_id);
      } else {
        await userLikeReview(userCurrent.current?.id, reviewId);
      }
    } catch (error) {
      // Rollback nếu lỗi
      setReviews((prevReviews) =>
        prevReviews.map((review) => {
          if (review.id === reviewId) {
            const isLiked = review.user_like_id !== null;
            return {
              ...review,
              user_like_id: isLiked ? null : 1,
              like_count: isLiked
                ? review.like_count - 1
                : review.like_count + 1,
            };
          }
          return review;
        })
      );
    }
  };

  const getAverageRating = () => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.tour_star, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getStarDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach((review) => {
      distribution[review.tour_star - 1]++;
    });
    return distribution.reverse();
  };

useEffect(() => {
  const loadReviewsWithUsers = async () => {
    try {
      setLoading(true);
      console.log("Tour id: ", tourId);
      const res = await fetchReviewByTourId(tourId);
      const data = res.data;

      console.log("User profile: ", userCurrent.current);

      const mapped = await Promise.all(
        data.map(async (review: any): Promise<Review> => {
          try {
            const likeRes = await getLikesByUserIdAndReviewId(
              userCurrent.current!.id,
              review.id
            );
            const likeResData = likeRes.data;
            console.log("Like res data: ", likeResData);
            return {
              ...review,
              user: review.user ?? {
                id: 0,
                first_name: "Ẩn danh",
                last_name: "",
                avatar: "/public/avatar-default.jpg",
              },
              like_count: review.like_count ?? 0,
              user_like_id: likeResData[0].id
            };
          } catch (error) {
            return {
              ...review,
              user: review.user ?? {
                id: 0,
                first_name: "Ẩn danh",
                last_name: "",
                avatar: "/public/avatar-default.jpg",
              },
              like_count: review.like_count ?? 0,
              user_like_id: null
            };
          }
        })
      );

      setReviews(mapped);
      setLoading(false);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]); // fallback tránh crash
      setLoading(false);
    }
  };

  loadReviewsWithUsers();
}, []);


  useEffect(() => {
    console.log("review: ", reviews);
  }, [reviews]);

  function divideIntegers(a: number, b: number): number {
    if (b === 0) {
      return 0;
    }
    return Math.floor(a / b); // hoặc Math.trunc(a / b) tùy bạn muốn làm tròn xuống hay về 0
  }

  return (
    <div className="scale-90 max-w-6xl mx-auto">
      {loading ? (
        <Loading />
      ) : (
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl">
              <MessageCircle className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h2 className="text-[20px] font-bold text-gray-800">
                Đánh giá khách hàng
              </h2>
              <p className="text-gray-600">
                {reviews.length} đánh giá từ khách du lịch
              </p>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left: Rating Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-8 border border-gray-200 sticky top-6">
                <div className="text-center mb-6">
                  <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text mb-2">
                    {getAverageRating()}
                  </div>
                  <div className="flex justify-center mb-2">
                    {renderStars(divideIntegers(totalStar, reviewCount))}
                  </div>
                  <p className="text-gray-600 font-medium">
                    {reviewCount} lượt đánh giá
                  </p>
                </div>

                {/* Star Distribution */}
                <div className="space-y-2">
                  {getStarDistribution().map((count, index) => {
                    const starLevel = 5 - index;
                    const percentage =
                      reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                    return (
                      <div
                        key={starLevel}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="w-6 text-gray-600">{starLevel}</span>
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-gray-500">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Reviews List */}
            <div className="lg:col-span-2">
              {reviews.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    Chưa có đánh giá
                  </h3>
                  <p className="text-gray-500">
                    Trở thành người đầu tiên chia sẻ trải nghiệm của bạn!
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review, index) => (
                    <div
                      key={review.id}
                      className="group bg-white rounded-3xl p-8 border border-gray-200 transition-all duration-300 hover:border-orange-300"
                    >
                      <div className="flex gap-6">
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0">
                          {review.user?.avatar ? (
                            <img
                              src={review.user.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {review.user?.first_name
                                ?.charAt(0)
                                .toUpperCase() || "?"}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-bold text-gray-800 text-lg mb-1">
                                {review.user!.first_name +
                                  " " +
                                  review.user!.last_name || "User"}
                              </h4>
                              {renderStars(review.tour_star)}
                            </div>
                            <div className="flex items-center gap-2 text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                {formatDate(review.created_at)}
                              </span>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-2xl p-6 mb-4 border-l-4 border-amber-400">
                            <p className="text-gray-700 leading-relaxed text-lg italic">
                              "{review.text}"
                            </p>
                          </div>

                          <div className="flex items-center justify-between">
                            <button
                              onClick={() => handleToggleLike(review.id)}
                              className={`flex items-center gap-3 px-6 py-3 rounded-2xl transition-all group-hover:scale-105 border 
                            ${
                              !!review.user_like_id
                                ? "bg-gradient-to-r from-pink-200 to-rose-200 border-pink-300"
                                : "bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 border-pink-200"
                            }`}
                            >
                              {!!review.user_like_id ? (
                                <Heart className="w-5 h-5 text-pink-600 fill-pink-600" />
                              ) : (
                                <Heart className="w-5 h-5 text-pink-500" />
                              )}

                              <span
                                className={`font-semibold ${
                                  !review.user_like_id
                                    ? "text-pink-800"
                                    : "text-pink-700"
                                }`}
                              >
                                {!!review.user_like_id
                                  ? `${review.like_count} `
                                  : `${review.like_count}`}
                              </span>
                            </button>

                            {/* <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <span>Hữu ích?</span>
                              <button className="hover:text-amber-500 transition-colors">
                                👍
                              </button>
                              <button className="hover:text-amber-500 transition-colors">
                                👎
                              </button>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
