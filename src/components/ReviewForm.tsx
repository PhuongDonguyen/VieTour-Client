import React, { useEffect, useState, useRef } from "react";

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
  onSubmit: (rating: number, comment: string, images: File[]) => void;
  onClose: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({
  booking,
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const originalOverflow = window.getComputedStyle(document.body).overflow;
    const originalPadding = document.body.style.paddingRight;

    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = "16px";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPadding;
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isValidType = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
      ].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

      if (!isValidType) {
        alert(
          `File ${file.name} không phải là hình ảnh hợp lệ. Chỉ chấp nhận: JPG, PNG, WEBP, GIF`
        );
        return false;
      }

      if (!isValidSize) {
        alert(`File ${file.name} quá lớn. Kích thước tối đa là 5MB`);
        return false;
      }

      return true;
    });

    if (images.length + validFiles.length > 10) {
      alert("Bạn chỉ có thể tải lên tối đa 10 hình ảnh!");
      return;
    }

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    // Tạo URL để preview
    validFiles.forEach((file) => {
      const url = URL.createObjectURL(file);
      setImageUrls((prev) => [...prev, url]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newImageUrls = imageUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("Vui lòng chọn số sao!");
      return;
    }

    if (comment.trim().length < 10) {
      alert("Vui lòng viết đánh giá ít nhất 10 ký tự!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(rating, comment, images);
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-75">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        <h2 className="text-xl font-bold mb-4 text-center">
          Đánh giá {booking.schedule.tour.title}
        </h2>

        {/* Star rating */}
        <div className="flex justify-center space-x-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={`text-2xl ${
                star <= rating ? "text-yellow-400" : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Comment */}
        <textarea
          className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4"
          rows={4}
          placeholder="Viết đánh giá của bạn..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* Image Upload Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thêm hình ảnh (tối đa 10 ảnh, mỗi ảnh tối đa 5MB)
          </label>

          {/* Upload Button */}
          <div className="flex items-center space-x-2 mb-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Chọn ảnh
            </button>
            <span className="text-sm text-gray-500">
              {images.length}/10 ảnh
            </span>
          </div>

          {/* Drag and Drop Zone */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("border-blue-400", "bg-blue-50");
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
              const files = Array.from(e.dataTransfer.files);
              const validFiles = files.filter((file) => {
                const isValidType = [
                  "image/jpeg",
                  "image/png",
                  "image/webp",
                  "image/gif",
                ].includes(file.type);
                const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit

                if (!isValidType) {
                  alert(
                    `File ${file.name} không phải là hình ảnh hợp lệ. Chỉ chấp nhận: JPG, PNG, WEBP, GIF`
                  );
                  return false;
                }

                if (!isValidSize) {
                  alert(`File ${file.name} quá lớn. Kích thước tối đa là 5MB`);
                  return false;
                }

                return true;
              });

              if (images.length + validFiles.length > 10) {
                alert("Bạn chỉ có thể tải lên tối đa 10 hình ảnh!");
                return;
              }

              const newImages = [...images, ...validFiles];
              setImages(newImages);

              // Tạo URL để preview
              validFiles.forEach((file) => {
                const url = URL.createObjectURL(file);
                setImageUrls((prev) => [...prev, url]);
              });
            }}
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click để chọn ảnh
              </span>{" "}
              hoặc kéo thả ảnh vào đây
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, WEBP, GIF tối đa 5MB
            </p>
          </div>

          {/* Image Preview Grid */}
          {imageUrls.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Ảnh đã chọn:
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border shadow-sm"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title="Xóa ảnh"
                    >
                      ×
                    </button>
                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-gray-600 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-400 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-2 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang gửi...
              </>
            ) : (
              "Gửi đánh giá"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
