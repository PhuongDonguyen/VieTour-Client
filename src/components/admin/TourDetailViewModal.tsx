import React from "react";
import LargeModal from "@/components/LargeModal";
import TourDetailViewContent from "./TourDetailViewContent";

interface TourDetailViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  detailId: string;
}

const TourDetailViewModal: React.FC<TourDetailViewModalProps> = ({
  isOpen,
  onClose,
  detailId,
}) => {
  return (
    <LargeModal isOpen={isOpen} onClose={onClose}>
      <div className="w-full h-full overflow-y-auto p-6">
        <TourDetailViewContent
          detailId={detailId}
          onBack={onClose}
          showHeader={false}
        />
      </div>
    </LargeModal>
  );
};

export default TourDetailViewModal;
