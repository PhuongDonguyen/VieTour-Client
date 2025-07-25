import React, { useEffect, useState , } from "react";


export interface Tour {
  id: number;
  title: string;
  poster_url: string;
  provider_id: number;
  capacity: number;
  transportation: string;
  accommodation: string;
  destination_intro: string;
  view_count: string;
  slug: string;
  tour_category_id: number;
  is_active: boolean;
  total_star: number;
  review_count: number;
  live_commentary: string;
  duration: string;
  booked_count: number;
}

export interface Schedule {
  id: number;
  start_date: string;
  participant: number;
  status: string;
  tour_id: number;
  tour: Tour;
}

export interface BookingDetail {
  id: number;
  booking_id: number;
  adult_quanti: number;
  kid_quanti: number;
  adult_price: number;
  kid_price: number;
  note: string;
}

export interface Booking {
  id: number;
  user_id: number;
  schedule_id: number;
  total: number;
  status: string;
  payment_id: string | null;
  txn_ref: string | null;
  create_at: string;
  is_reviewed: boolean;
  client_name: string;
  client_phone: string;
  note: string;
  schedule: Schedule;
  booking_details?: BookingDetail[];
}
interface ReviewFormProps {
  booking: Booking;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ booking, onSubmit, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

useEffect(() => {
  const originalOverflow = window.getComputedStyle(document.body).overflow;
  const originalPadding = document.body.style.paddingRight;

  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = "16px"; // hoặc 'calc(100vw - 100%)'

  return () => {
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPadding;
  };
}, []);


  const handleSubmit = () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao!");
      return;
    }
    onSubmit(rating, comment);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">Đánh giá {booking.schedule.tour.title}</h2>

        {/* Star rating */}
        <div className="flex justify-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          rows={4}
          placeholder="Viết đánh giá của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* Actions */}
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200"
          >
            Gửi đánh giá
          </button>
        </div>
      </div>
    </div>
  );
};
