import React, { useState, useEffect } from 'react';

type GalleryImage = {
  id: number;
  image_url: string;
  alt_text?: string;
};

interface TabGalleryProps {
  images: GalleryImage[];
}

const TabGallery: React.FC<TabGalleryProps> = ({ images }) => {
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [fade, setFade] = useState(false);

  // Hide floating contact buttons when modal is open
  useEffect(() => {
    if (modalIdx !== null) {
      document.body.classList.add('modal-gallery-open');
    } else {
      document.body.classList.remove('modal-gallery-open');
    }
    return () => {
      document.body.classList.remove('modal-gallery-open');
    };
  }, [modalIdx]);

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
    // eslint-disable-next-line
  }, [modalIdx]);

  useEffect(() => {
    const event = new CustomEvent('gallery-modal-toggle', { detail: { open: modalIdx !== null } });
    window.dispatchEvent(event);
    return () => {
      const closeEvent = new CustomEvent('gallery-modal-toggle', { detail: { open: false } });
      window.dispatchEvent(closeEvent);
    };
  }, [modalIdx]);

  if (!images || images.length === 0) {
    return <div className="p-8 text-center text-gray-500">Chưa có hình ảnh cho tour này.</div>;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Hình ảnh tour</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {images.map((img, idx) => (
          <button
            key={img.id}
            className="aspect-square w-full bg-gray-100 rounded-xl overflow-hidden focus:outline-none"
            onClick={() => openModal(idx)}
            tabIndex={0}
            aria-label="Xem ảnh lớn"
          >
            <img
              src={img.image_url}
              alt={img.alt_text || ''}
              className="w-full h-full object-cover rounded-xl transition-transform duration-200 hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      {/* Modal xem ảnh lớn với chuyển ảnh */}
      {modalIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={closeModal}>
          <div className="relative flex items-center justify-center w-full h-full">
            <button
              className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white text-3xl rounded-full w-12 h-12 flex items-center justify-center z-10"
              onClick={e => { e.stopPropagation(); showPrev(); }}
              aria-label="Ảnh trước"
            >&#8592;</button>
            <img
              src={images[modalIdx].image_url}
              alt={images[modalIdx].alt_text || ''}
              className={`max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl border-4 border-white transition-opacity duration-200 ${fade ? 'opacity-100' : 'opacity-0'}`}
              onClick={e => e.stopPropagation()}
              draggable={false}
            />
            <button
              className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white text-3xl rounded-full w-12 h-12 flex items-center justify-center z-10"
              onClick={e => { e.stopPropagation(); showNext(); }}
              aria-label="Ảnh sau"
            >&#8594;</button>
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold bg-black/50 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={closeModal}
              aria-label="Đóng"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TabGallery; 