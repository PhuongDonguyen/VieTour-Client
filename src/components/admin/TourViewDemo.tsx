import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import TourViewModal from "./TourViewModal";

interface TourViewDemoProps {
  tourId: string;
  tourTitle: string;
}

const TourViewDemo: React.FC<TourViewDemoProps> = ({ tourId, tourTitle }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        View {tourTitle}
      </Button>

      <TourViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tourId={tourId}
      />
    </div>
  );
};

export default TourViewDemo;
