import React, { useEffect, useState } from 'react';
import { fetchTourImagesLimit } from '../services/tourImage.service';
import { getTourById } from '../apis/tour.api';
import { Loading } from '@/components/Loading';
import ReactModal from 'react-modal';

interface TourImage {
  id: number;
  image_url: string;
  alt_text?: string;
  tour_id?: number;
}

const PAGE_SIZE = 15;

const TourImageGallery: React.FC = () => {
  const [images, setImages] = useState<TourImage[]>([]);
  const [tourNames, setTourNames] = useState<Record<number, string>>({});
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
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 400 &&
        !loading &&
        hasMore
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        loadImages(nextPage);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [page, hasMore, loading]);

  const loadImages = async (pageToLoad: number, reset = false) => {
    setLoading(true);
    try {
      const imgs: TourImage[] = await fetchTourImagesLimit(pageToLoad, PAGE_SIZE);
      if (imgs.length < PAGE_SIZE) setHasMore(false);
      else setHasMore(true);
      const newImages = reset ? imgs : [...images, ...imgs];
      setImages(newImages);
      // Lấy tên tour cho các tour_id mới
      const uniqueTourIds = Array.from(new Set(imgs.map(img => typeof img.tour_id === 'number' ? img.tour_id : null).filter((id): id is number => id !== null)));
      const names: Record<number, string> = { ...tourNames };
      await Promise.all(uniqueTourIds.map(async (id: number) => {
        if (!names[id]) {
          try {
            const tourRes = await getTourById(id);
            names[id] = tourRes.data?.name || `Tour #${id}`;
          } catch {
            names[id] = `Tour #${id}`;
          }
        }
      }));
      setTourNames(names);
    } catch (err) {
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
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [modalIdx]);

  if (!images.length && loading) return <div className="p-8 mt-30 text-center"><Loading /></div>;
  if (!images.length) return <div className="p-8 text-center text-gray-500">Không có hình ảnh tour nào.</div>;

  return (
    <div className="w-full mt-20 max-w-7xl mx-auto p-4">
      <h2 className="text-3xl md:text-4xl font-bold text-[#015294] mb-8 text-center">Tất cả hình ảnh tour</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img, idx) => (
          <div key={img.id} className="aspect-square w-full bg-gray-100 rounded-xl overflow-hidden cursor-pointer" onClick={() => openModal(idx)}>
            <img
              src={img.image_url}
              alt={img.alt_text || ''}
              className="w-full h-full object-cover rounded-xl"
              loading="lazy"
            />
            {typeof img.tour_id === 'number' && (
              <div className="text-xs text-center mt-1 text-gray-700 font-medium">
                {tourNames[img.tour_id] || `Tour #${img.tour_id}`}
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Modal xem ảnh lớn */}
      <ReactModal
        isOpen={modalIdx !== null}
        onRequestClose={closeModal}
        ariaHideApp={false}
        className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80"
        overlayClassName="fixed inset-0 z-40 bg-black bg-opacity-80"
        style={{ content: { background: 'none', border: 'none', padding: 0 } }}
      >
        {modalIdx !== null && images[modalIdx] && (
          <div className="relative flex flex-col items-center">
            <button onClick={closeModal} className="absolute top-2 right-2 text-white text-3xl font-bold z-10">×</button>
            <button onClick={showPrev} className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-3xl z-10">&#8592;</button>
            <img
              src={images[modalIdx].image_url}
              alt={images[modalIdx].alt_text || ''}
              className={`max-h-[80vh] max-w-[90vw] rounded-xl shadow-lg transition-opacity duration-200 ${fade ? 'opacity-100' : 'opacity-0'}`}
              style={{ background: '#eee' }}
            />
            <button onClick={showNext} className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-3xl z-10">&#8594;</button>
            <div className="mt-4 text-white text-center">
              {typeof images[modalIdx].tour_id === 'number' && (
                <div className="font-semibold">{tourNames[images[modalIdx].tour_id] || `Tour #${images[modalIdx].tour_id}`}</div>
              )}
              <div>{images[modalIdx].alt_text}</div>
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
            {loading ? <Loading /> : 'Xem thêm'}
          </button>
        </div>
      )}
      {loading && images.length > 0 && (
        <div className="flex justify-center mt-6 "><Loading /></div>
      )}
    </div>
  );
};

export default TourImageGallery; 