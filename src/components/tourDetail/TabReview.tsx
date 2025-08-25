import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Heart,
  MessageCircle,
  Clock,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { fetchAllReviews, type ReviewResponse } from "../../services/review.service";
import {
  deleteLike,
  getLikesByUserIdAndReviewId,
  userLikeReview,
} from "../../services/like.service";
import { useAuth } from "@/hooks/useAuth";

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
  review_images?: { id: number; image_url: string }[];
  images?: string[];
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

// Utility functions
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

const getUserDisplayName = (user: User | null): string => {
  if (!user) return "Khách";
  return `${user.first_name} ${user.last_name}`.trim();
};

const getUserInitials = (user: User | null): string => {
  if (!user) return "K";
  const name = getUserDisplayName(user);
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
};

const getAvatarStyling = (user: User | null) => {
  if (!user) {
    return {
      bgColor: "bg-orange-500",
      textColor: "text-white",
    };
  }
  return {
    bgColor: "bg-orange-100",
    textColor: "text-orange-600",
  };
};

// Loading Components
const ReviewSkeleton: React.FC = () => (
  <div className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0">
    <div className="flex items-start gap-4">
      {/* Avatar Skeleton */}
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>

      {/* Content Skeleton */}
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
          <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const ReviewSkeletonList: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <ReviewSkeleton key={i} />
    ))}
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <div className="text-center py-12">
    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      Chưa có đánh giá nào
    </h3>
    <p className="text-gray-600">
      Hãy trở thành người đầu tiên chia sẻ trải nghiệm của bạn!
    </p>
  </div>
);

// Star Filter Component
const StarFilter: React.FC<{
  selectedStar: number | null;
  onStarSelect: (star: number | null) => void;
  starDistribution: number[];
}> = ({ selectedStar, onStarSelect, starDistribution }) => {
  const totalReviews = starDistribution.reduce((sum, count) => sum + count, 0);

  return (
    <div className="bg-white rounded-xl p-0 mb-10">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onStarSelect(null)}
          disabled={totalReviews === 0}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-sm ${
            selectedStar === null
              ? "bg-orange-500 border-orange-500 text-white"
              : totalReviews === 0
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
          }`}
        >
          <span className="font-medium">Tất cả</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${
            selectedStar === null
              ? "bg-white/20"
              : totalReviews === 0
              ? "bg-gray-300 text-gray-500"
              : "bg-gray-200"
          }`}>
            {totalReviews}
          </span>
        </button>
        
        {[5, 4, 3, 2, 1].map((star) => {
          const count = starDistribution[5 - star];
          const isDisabled = count === 0;
          
          return (
            <button
              key={star}
              onClick={() => !isDisabled && onStarSelect(star)}
              disabled={isDisabled}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-all text-sm ${
                selectedStar === star
                  ? "bg-orange-500 border-orange-500 text-white"
                  : isDisabled
                  ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3 h-3 ${
                      i < star 
                        ? isDisabled 
                          ? "text-gray-300 fill-gray-300" 
                          : "text-amber-400 fill-amber-400" 
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{star}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full min-w-[1.5rem] text-center ${
                selectedStar === star
                  ? "bg-white/20"
                  : isDisabled
                  ? "bg-gray-300 text-gray-500"
                  : "bg-gray-200"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Pagination Component
const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}> = ({ currentPage, totalPages, onPageChange, isLoading }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || isLoading}
        className={`p-2 rounded-lg border transition-all ${
          currentPage === 1 || isLoading
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || isLoading}
          className={`px-3 py-2 rounded-lg border transition-all ${
            page === currentPage
              ? "bg-orange-500 border-orange-500 text-white"
              : page === '...'
              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || isLoading}
        className={`p-2 rounded-lg border transition-all ${
          currentPage === totalPages || isLoading
            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
        }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};



export const TabReview: React.FC<ReviewListProps> = ({
  tourId,
  totalStar,
  reviewCount,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [imageModal, setImageModal] = useState<{
    isOpen: boolean;
    images: string[];
    currentIndex: number;
  }>({
    isOpen: false,
    images: [],
    currentIndex: 0,
  });
  const { user } = useAuth();
  const userCurrent = useRef<User | null>(null);

  // Pagination and filtering states
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [summary, setSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingCounts: {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
    },
  });

  useEffect(() => {
    const loadUserCurrent = async () => {
      try {
        userCurrent.current = {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          avatar: user.avatar,
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
        await deleteLike(reviewId);
      } else {
        const res = await userLikeReview(reviewId);
        console.log("res: ", res);
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
    return summary.averageRating.toFixed(1);
  };

  const getStarDistribution = () => {
    return [
      summary.ratingCounts["5"],
      summary.ratingCounts["4"],
      summary.ratingCounts["3"],
      summary.ratingCounts["2"],
      summary.ratingCounts["1"],
    ];
  };

  const loadReviews = async (page: number = 1, starFilter: number | null = null) => {
    try {
      setLoading(true);
      console.log("Tour id: ", tourId);
      
      const params: any = {
        tour_id: tourId,
        page,
        limit: 3,
      };
      
      if (starFilter !== null) {
        params.tour_star = starFilter;
      }
      
      const res = await fetchAllReviews(params);
      const data = res.data;
      const paginationData = res.pagination;
      const summaryData = res.summary;

      console.log("User profile: ", userCurrent.current);

      const mapped = await Promise.all(
        data.map(async (review: any): Promise<Review> => {
          try {
            const likeRes = await getLikesByUserIdAndReviewId(review.id);
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
              user_like_id: likeResData.length > 0 ? likeResData[0].id : null,
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
              user_like_id: null,
            };
          }
        })
      );

      setReviews(mapped);
      setPagination(paginationData);
      setSummary(summaryData);
      setLoading(false);
    } catch (error) {
      console.error("Error loading reviews:", error);
      setReviews([]); // fallback tránh crash
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(currentPage, selectedStar);
  }, [currentPage, selectedStar]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStarFilter = (star: number | null) => {
    setSelectedStar(star);
    setCurrentPage(1); // Reset to first page when filtering
  };

  useEffect(() => {
    console.log("review: ", reviews);
  }, [reviews]);

  function divideIntegers(a: number, b: number): number {
    if (b === 0) {
      return 0;
    }
    return Math.floor(a / b);
  }

  const openImageModal = (images: string[], startIndex: number = 0) => {
    setImageModal({
      isOpen: true,
      images,
      currentIndex: startIndex,
    });
  };

  const closeImageModal = () => {
    setImageModal({
      isOpen: false,
      images: [],
      currentIndex: 0,
    });
  };

  const nextImage = () => {
    setImageModal((prev) => ({
      ...prev,
      currentIndex: (prev.currentIndex + 1) % prev.images.length,
    }));
  };

  const prevImage = () => {
    setImageModal((prev) => ({
      ...prev,
      currentIndex:
        prev.currentIndex === 0
          ? prev.images.length - 1
          : prev.currentIndex - 1,
    }));
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!imageModal.isOpen) return;

    switch (e.key) {
      case "ArrowRight":
        nextImage();
        break;
      case "ArrowLeft":
        prevImage();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [imageModal.isOpen]);

  return (
    <div className="w-full mb-5 max-w-7xl mx-auto bg-white rounded-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Đánh giá từ khách hàng ({summary.totalReviews})
        </h2>
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
                {summary.totalReviews} lượt đánh giá
              </p>
            </div>

            {/* Star Distribution */}
            <div className="space-y-2">
              {getStarDistribution().map((count, index) => {
                const starLevel = 5 - index;
                const percentage =
                  summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;

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
          {/* Star Filter - Horizontal Bar */}
          <StarFilter
            selectedStar={selectedStar}
            onStarSelect={handleStarFilter}
            starDistribution={getStarDistribution()}
          />
          {loading ? (
            <ReviewSkeletonList />
          ) : reviews.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <div className="space-y-4">
                {reviews.map((review, index) => {
                  const avatarStyling = getAvatarStyling(review.user);

                  return (
                    <div
                      key={review.id}
                      className="border-b border-gray-100 pb-4 mb-4 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${avatarStyling.bgColor}`}
                        >
                          {review.user?.avatar ? (
                            <img
                              src={review.user.avatar}
                              alt="Avatar"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span
                              className={`text-sm font-bold ${avatarStyling.textColor}`}
                            >
                              {getUserInitials(review.user)}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-gray-900">
                              {getUserDisplayName(review.user)}
                            </h4>
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(review.created_at)}
                            </span>
                          </div>

                          <div className="mb-3">
                            {renderStars(review.tour_star)}
                          </div>

                          <p className="text-gray-700 leading-relaxed mb-3">
                            {review.text}
                          </p>

                          {/* Review Images */}
                          {((review.review_images && review.review_images.length > 0) ||
                            (review.images && review.images.length > 0)) && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              {(review.review_images && review.review_images.length > 0
                                ? review.review_images.map(
                                    (img: any) => img.image_url
                                  )
                                : review.images || []
                              ).map((url: string, idx: number) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`Ảnh review ${idx + 1}`}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                                  onClick={() =>
                                    openImageModal(
                                      review.review_images && review.review_images.length > 0
                                        ? review.review_images.map(
                                            (img: any) => img.image_url
                                          )
                                        : review.images || [],
                                      idx
                                    )
                                  }
                                />
                              ))}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handleToggleLike(review.id)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border 
                                ${
                                  !!review.user_like_id
                                    ? "bg-gradient-to-r from-pink-200 to-rose-200 border-pink-300"
                                    : "bg-gradient-to-r from-pink-100 to-rose-100 hover:from-pink-200 hover:to-rose-200 border-pink-200"
                                }`}
                            >
                              {!!review.user_like_id ? (
                                <Heart className="w-4 h-4 text-pink-600 fill-pink-600" />
                              ) : (
                                <Heart className="w-4 h-4 text-pink-500" />
                              )}
                              <span
                                className={`text-sm font-medium ${
                                  !review.user_like_id
                                    ? "text-pink-800"
                                    : "text-pink-700"
                                }`}
                              >
                                {review.like_count}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                isLoading={loading}
              />
            </>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {imageModal.isOpen &&
        createPortal(
          <AnimatePresence>
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Backdrop */}
              <motion.div
                className="absolute inset-0 bg-black/60"
                onClick={closeImageModal}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              {/* Modal Content */}
              <motion.div
                className="relative z-10 w-full h-full flex items-center justify-center p-4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {/* Close Button */}
                <motion.button
                  onClick={closeImageModal}
                  className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: 0.1 }}
                >
                  <X className="w-6 h-6" />
                </motion.button>

                {/* Image */}
                <motion.div 
                  className="relative w-full h-full flex items-center justify-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <img
                    src={imageModal.images[imageModal.currentIndex]}
                    alt={`Ảnh review ${imageModal.currentIndex + 1}`}
                    className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                  />
                  
                  {/* Navigation Buttons */}
                  {imageModal.images.length > 1 && (
                    <>
                      <motion.button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: 0.2 }}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </motion.button>
                      <motion.button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: 0.2 }}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </motion.button>
                    </>
                  )}
                </motion.div>

                {/* Image Counter */}
                {imageModal.images.length > 1 && (
                  <motion.div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-black/50 text-white rounded-full text-sm font-medium"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ delay: 0.3 }}
                  >
                    {imageModal.currentIndex + 1} / {imageModal.images.length}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
