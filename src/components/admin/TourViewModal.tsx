import React from "react";
import LargeModal from "@/components/LargeModal";
import TourViewContent from "./TourViewContent";

interface TourViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: string;
}

const TourViewModal: React.FC<TourViewModalProps> = ({
  isOpen,
  onClose,
  tourId,
}) => {
  return (
    <LargeModal isOpen={isOpen} onClose={onClose}>
      <div className="w-full h-full overflow-y-auto p-6">
        <TourViewContent tourId={tourId} onBack={onClose} showHeader={false} />
      </div>
    </LargeModal>
  );
};

export default TourViewModal;
