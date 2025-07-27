import React from "react";
import LargeModal from "@/components/LargeModal";
import TourPriceViewContent from "./TourPriceViewContent";

interface TourPriceViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceId: string;
}

const TourPriceViewModal: React.FC<TourPriceViewModalProps> = ({
  isOpen,
  onClose,
  priceId,
}) => {
  return (
    <LargeModal isOpen={isOpen} onClose={onClose}>
      <div className="w-full h-full overflow-y-auto p-6">
        <TourPriceViewContent
          priceId={priceId}
          onBack={onClose}
          showHeader={false}
        />
      </div>
    </LargeModal>
  );
};

export default TourPriceViewModal;
