import React from "react";

type TourImageProps = {
  images: { id: number; image_url: string; alt_text?: string }[];
  altDefault?: string;
};

const TourImage: React.FC<TourImageProps> = ({ images, altDefault }) => {
  if (!images || images.length === 0) return null;
  return (
    <div className="flex flex-col gap-4 w-full">
      {images.map((img) => (
        <img
          key={img.id}
          src={img.image_url}
          alt={img.alt_text || altDefault || ""}
          className="w-full max-w-full h-auto object-contain rounded-lg mx-auto"
          style={{ display: "block", background: "#fff" }}
        />
      ))}
    </div>
  );
};

export default TourImage;
