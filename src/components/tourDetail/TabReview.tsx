import React, { useEffect, useState } from "react";
import { Star, Heart, MessageCircle, Clock } from "lucide-react";
import { fetchReviewByTourId } from "../../services/review.service";
import { Loading } from "../Loading";
import {
  fetchUserById,
  fetchUserProfile,
} from "../../services/userProfile.service";
import { userLikeReview } from "../../services/like.service";

interface Review {
  id: number;
  user_id: number;
  tour_id: number;
  tour_star: number;
  text: string;
  like_count: number;
  created_at: string;
  user: User | null;
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
  const [userCurrent, setUserCurrent] = useState<User | null>(null);
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
        setUserCurrent({
          id: data.id,
          first_name: data.first_name,
          last_name: data.last_name,
          avatar: data.avatar,
        });
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

  const handleLike = async (reviewId: number) => {
    if (!userCurrent) return;
    try {
      const res = await userLikeReview(userCurrent?.id, reviewId);
    } catch (error) {}
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
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

  const getUserName = (userId: number) => {
    const names = ["Minh Anh", "Thành Long", "Hương Lan", "Đức Nam", "Thu Hà"];
    return names[userId % names.length];
  };

  const getRandomColor = (id: number) => {
    const colors = [
      "from-pink-400 to-rose-500",
      "from-blue-400 to-indigo-500",
      "from-green-400 to-emerald-500",
      "from-purple-400 to-violet-500",
      "from-orange-400 to-red-500",
      "from-teal-400 to-cyan-500",
    ];
    return colors[id % colors.length];
  };

  useEffect(() => {
    const loadReviewsWithUsers = async () => {
      try {
        const res = await fetchReviewByTourId(tourId);
        const data = res.data;

        const reviewsWithUser: Review[] = await Promise.all(
          data.map(async (rv: any): Promise<Review> => {
            try {
              const resData = await fetchUserById(rv.user_id);
              const userRes = resData.data;
              const userReview = {
                id: userRes.id,
                first_name: userRes.first_name,
                last_name: userRes.last_name,
                avatar: userRes.avatar,
              };

              return {
                id: rv.id,
                user_id: rv.user_id,
                tour_id: rv.tour_id,
                tour_star: rv.tour_star,
                text: rv.text,
                like_count: rv.like_count,
                created_at: rv.created_at,
                user: userReview,
              };
            } catch (err) {
              console.warn(`Failed to fetch user ${rv.user_id}:`, err);
              return {
                id: rv.id,
                user_id: rv.user_id,
                tour_id: rv.tour_id,
                tour_star: rv.tour_star,
                text: rv.text,
                like_count: rv.like_count,
                created_at: rv.created_at,
                user: {
                  id: 0,
                  first_name: "User",
                  last_name: "",
                  avatar: "",
                },
              };
            }
          })
        );

        setReviews(reviewsWithUser);
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    };

    loadReviewsWithUsers();
  }, []);

  function divideIntegers(a: number, b: number): number {
    if (b === 0) {
      throw new Error("Không thể chia cho 0");
    }
    return Math.floor(a / b); // hoặc Math.trunc(a / b) tùy bạn muốn làm tròn xuống hay về 0
  }

  return (
    <div className="max-w-6xl mx-auto">
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
              <h2 className="text-3xl font-bold text-gray-800">
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
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 sticky top-6">
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
                      className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2"
                    >
                      <div className="flex gap-6">
                        {/* Avatar */}
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getRandomColor(
                            review.id
                          )} flex items-center justify-center shadow-lg flex-shrink-0`}
                        >
                          <span className="text-white font-bold text-lg">
                            {getUserName(review.user_id).charAt(0)}
                          </span>
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
                              onClick={() => {
                                handleLike(review.id);
                              }}
                              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 rounded-2xl transition-all group-hover:scale-105 border border-pink-200"
                            >
                              <Heart className="w-5 h-5 text-pink-500" />
                              <span className="font-semibold text-pink-700">
                                {review.like_count} yêu thích
                              </span>
                            </button>

                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                              <span>Hữu ích?</span>
                              <button className="hover:text-amber-500 transition-colors">
                                👍
                              </button>
                              <button className="hover:text-amber-500 transition-colors">
                                👎
                              </button>
                            </div>
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
