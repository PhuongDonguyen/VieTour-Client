import React from "react";

interface RatingStarsProps {
  totalStar: number;
  reviewCount: number;
}

const starPath =
  "M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.222 \
3.77a1 1 0 00.95.69h3.971c.969 0 1.371 1.24.588 \
1.81l-3.21 2.34a1 1 0 00-.364 1.118l1.222 \
3.77c.3.921-.755 1.688-1.54 1.118l-3.21-2.34a1 1 \
0 00-1.176 0l-3.21 2.34c-.785.57-1.84-.197-1.54-1.118l1.222-3.77a1 \
1 0 00-.364-1.118l-3.21-2.34c-.783-.57-.38-1.81.588-1.81h3.971a1 1 \
0 00.95-.69l1.222-3.77z";

export const RatingStars: React.FC<RatingStarsProps> = ({
  totalStar,
  reviewCount,
}) => {
  const rate = parseFloat((reviewCount > 0 ? totalStar / reviewCount : 0).toFixed(1));
  const fullStars = Math.floor(rate);
  const decimalPart = rate % 1;

  return (
    <div className="flex items-center gap-1 mt-2">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < fullStars) {
          return (
            <svg
              key={i}
              className="w-4 h-4 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d={starPath} />
            </svg>
          );
        } else if (i === fullStars && decimalPart > 0) {
          return (
            <div key={i} className="relative w-4 h-4">
              {/* Gray background star */}
              <svg
                className="absolute top-0 left-0 w-4 h-4 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d={starPath} />
              </svg>

              {/* Yellow clipped overlay */}
              <div
                className="absolute top-0 left-0 h-4 overflow-hidden"
                style={{ width: `${decimalPart * 100}%` }}
              >
                <svg
                  className="w-4 h-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d={starPath} />
                </svg>
              </div>
            </div>
          );
        } else {
          return (
            <svg
              key={i}
              className="w-4 h-4 text-gray-300"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d={starPath} />
            </svg>
          );
        }
      })}
    <span className="text-xs text-gray-600 ml-1">({rate})</span>
      {/* Số lượt đánh giá */}
      <span className="text-xs text-gray-600 ml-1">({reviewCount} đánh giá)</span>
    </div>
  );
};
