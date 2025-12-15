import React, { useState } from "react";
import { ImageSize, ImageQuality, transformCloudinaryUrl } from "../../utils/imageUtils";

type TourImageProps = {
  images: { id: number; image_url: string; alt_text?: string }[];
  altDefault?: string;
};

const TourImage: React.FC<TourImageProps> = ({ images, altDefault }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) return null;

  return (
    <div className="w-full space-y-4">
      {/* Main image */}
      <div className="relative group">
        <img
          src={transformCloudinaryUrl(images[selectedImage]?.image_url, ImageSize.CARD, ImageQuality.HIGH)}
          alt={images[selectedImage]?.alt_text || altDefault || ""}
          className="w-full h-80 md:h-96 object-cover rounded-2xl shadow-lg transition-all duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
            {selectedImage + 1} / {images.length}
          </div>
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() =>
                setSelectedImage((prev) =>
                  prev > 0 ? prev - 1 : images.length - 1
                )
              }
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              onClick={() =>
                setSelectedImage((prev) =>
                  prev < images.length - 1 ? prev + 1 : 0
                )
              }
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-gray-700 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail gallery */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
          {images.map((img, index) => (
            <button
              key={img.id}
              onClick={() => setSelectedImage(index)}
              className={`relative group overflow-hidden rounded-lg transition-all duration-200 ${
                selectedImage === index
                  ? "ring-2 ring-orange-500 ring-offset-2"
                  : "hover:ring-2 hover:ring-orange-300 ring-offset-2"
              }`}
            >
              <img
                src={img.image_url}
                alt={img.alt_text || altDefault || ""}
                className="w-full h-16 md:h-20 object-cover transition-transform duration-200 group-hover:scale-110"
              />
              <div
                className={`absolute inset-0 transition-all duration-200 ${
                  selectedImage === index
                    ? "bg-orange-500/20"
                    : "bg-black/0 group-hover:bg-black/10"
                }`}
              ></div>
            </button>
          ))}
        </div>
      )}

      {/* Image info */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-orange-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Hình ảnh tour</h3>
            <p className="text-sm text-gray-600">
              {images.length} hình ảnh chất lượng cao về điểm đến
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourImage;
