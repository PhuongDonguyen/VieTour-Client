import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import TourDetailViewModal from "./TourDetailViewModal";

interface TourDetailViewDemoProps {
  detailId: string;
  detailTitle: string;
}

const TourDetailViewDemo: React.FC<TourDetailViewDemoProps> = ({
  detailId,
  detailTitle,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View {detailTitle}
      </Button>

      <TourDetailViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        detailId={detailId}
      />
    </div>
  );
};

export default TourDetailViewDemo;
