import React, { useEffect, useState } from "react";
import { getAllTourImages } from "../apis/tourImage.api";
import { Loading } from "@/components/Loading";
import ReactModal from "react-modal";

interface TourImage {
  id: number;
  image_url: string;
  alt_text?: string;
  tour_id?: number;
  tour?: {
    id: number;
    title: string;
  };
}

const PAGE_SIZE = 15;

const ImageSkeleton = () => (
  <div className="relative w-full bg-gray-200 rounded-xl overflow-hidden break-inside-avoid mb-4 animate-pulse">
    <div className="w-full h-64 bg-gray-300"></div>
  </div>
);

const GallerySkeleton = () => (
  <div className="w-full mt-20 max-w-7xl mx-auto p-4">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-[#015294] mb-4">Thư Viện Hình Ảnh Tour</h2>
      <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-2"></div>
      <p className="text-gray-600 mt-4">Khám phá vẻ đẹp của các tour du lịch qua bộ sưu tập hình ảnh</p>
    </div>
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
      {Array.from({ length: 12 }).map((_, idx) => (
        <ImageSkeleton key={idx} />
      ))}
    </div>
  </div>
);

const TourImageGallery: React.FC = () => {
  const [images, setImages] = useState<TourImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    loadImages(1, true);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!hasMore || loading) return;
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 400 &&
        !loading &&
        hasMore
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadImages(nextPage);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loading]);

  const loadImages = async (pageToLoad: number, reset = false) => {
    setLoading(true);
    try {
      const response = await getAllTourImages({
        page: pageToLoad,
        limit: PAGE_SIZE,
      });
      const imgs: TourImage[] = response.data;
      if (imgs.length < PAGE_SIZE) setHasMore(false);
      else setHasMore(true);
      const newImages = reset ? imgs : [...images, ...imgs];
      setImages(newImages);
    } catch (err) {
      console.error("Error loading images:", err);
      if (reset) setImages([]);
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadImages(nextPage);
  };

  const openModal = (idx: number) => {
    setModalIdx(idx);
    setFade(true);
  };

  const closeModal = () => setModalIdx(null);

  const showPrev = () => {
    if (modalIdx === null) return;
    setFade(false);
    setTimeout(() => {
      setModalIdx((prev) => (prev! - 1 + images.length) % images.length);
      setFade(true);
    }, 150);
  };

  const showNext = () => {
    if (modalIdx === null) return;
    setFade(false);
    setTimeout(() => {
      setModalIdx((prev) => (prev! + 1) % images.length);
      setFade(true);
    }, 150);
  };

  React.useEffect(() => {
    if (modalIdx === null) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [modalIdx]);

  if (!images.length && loading) {
    return <GallerySkeleton />;
  }

  if (!images.length) {
    return (
      <div className="w-full mt-20 max-w-7xl mx-auto p-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#015294] mb-4">Thư Viện Hình Ảnh Tour</h2>
          <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-2"></div>
          <p className="text-gray-600 mt-4">Khám phá vẻ đẹp của các tour du lịch qua bộ sưu tập hình ảnh</p>
        </div>
        <div className="text-center py-12 text-gray-500 text-lg">
          Không có hình ảnh tour nào.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mt-20 max-w-7xl mx-auto p-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-[#015294] mb-4">Thư Viện Hình Ảnh Tour</h2>
        <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full mb-2"></div>
        <p className="text-gray-600 mt-4">Khám phá vẻ đẹp của các tour du lịch qua bộ sưu tập hình ảnh</p>
      </div>
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map((img, idx) => (
          <div
            key={img.id}
            className="group relative w-full bg-gray-100 rounded-xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl break-inside-avoid mb-4"
            onClick={() => openModal(idx)}
          >
            <img
              src={img.image_url}
              alt={img.alt_text || ""}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Tour name overlay */}
            {img.tour && (
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-sm font-semibold drop-shadow-lg line-clamp-2">
                  {img.tour.title}
                </p>
              </div>
            )}

            {/* Zoom icon */}
            <div className="absolute top-2 right-2 bg-white/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      {/* Enhanced Modal */}
      <ReactModal
        isOpen={modalIdx !== null}
        onRequestClose={closeModal}
        ariaHideApp={false}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        overlayClassName="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        style={{ content: { background: "none", border: "none", padding: 0 } }}
      >
        {modalIdx !== null && images[modalIdx] && (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-3 text-white transition-all duration-300 hover:scale-110 group"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 text-white text-sm font-medium">
              {modalIdx + 1} / {images.length}
            </div>

            {/* Previous button */}
            <button
              onClick={showPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-4 text-white transition-all duration-300 hover:scale-110 group"
              aria-label="Previous"
            >
              <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Main image container */}
            <div className="relative max-w-6xl max-h-[85vh] flex flex-col items-center">
              <img
                src={images[modalIdx].image_url}
                alt={images[modalIdx].alt_text || ""}
                className={`max-h-[75vh] max-w-full rounded-2xl shadow-2xl object-contain transition-all duration-300 ${fade ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  }`}
              />

              {/* Image info */}
              <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 text-white text-center max-w-2xl">
                {images[modalIdx].tour && (
                  <div className="font-bold text-lg mb-2 text-orange-400">
                    {images[modalIdx].tour.title}
                  </div>
                )}
                {images[modalIdx].alt_text && (
                  <div className="text-sm text-gray-200">{images[modalIdx].alt_text}</div>
                )}
              </div>
            </div>

            {/* Next button */}
            <button
              onClick={showNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full p-4 text-white transition-all duration-300 hover:scale-110 group"
              aria-label="Next"
            >
              <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Keyboard hints */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 text-white/60 text-xs">
              <span>← → Navigate</span>
              <span>ESC Close</span>
            </div>
          </div>
        )}
      </ReactModal>
      {/* End Modal */}
      {hasMore && false && (
        <div className="flex justify-center mt-6">
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? <Loading /> : "Xem thêm"}
          </button>
        </div>
      )}
      {loading && images.length > 0 && (
        <div className="mt-6">
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {Array.from({ length: 8 }).map((_, idx) => (
              <ImageSkeleton key={`loading-${idx}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TourImageGallery;
