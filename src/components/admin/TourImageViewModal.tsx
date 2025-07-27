import React from "react";
import LargeModal from "@/components/LargeModal";
import TourImageViewContent from "./TourImageViewContent";

interface TourImageViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageId: string;
}

const TourImageViewModal: React.FC<TourImageViewModalProps> = ({
  isOpen,
  onClose,
  imageId,
}) => {
  return (
    <LargeModal isOpen={isOpen} onClose={onClose}>
      <div className="w-full h-full overflow-y-auto p-6">
        <TourImageViewContent
          imageId={imageId}
          onBack={onClose}
          showHeader={false}
        />
      </div>
    </LargeModal>
  );
};

export default TourImageViewModal;
