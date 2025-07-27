import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import TourPriceViewModal from "./TourPriceViewModal";

interface TourPriceViewDemoProps {
  priceId: string;
  priceTitle: string;
}

const TourPriceViewDemo: React.FC<TourPriceViewDemoProps> = ({
  priceId,
  priceTitle,
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
        View {priceTitle}
      </Button>

      <TourPriceViewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        priceId={priceId}
      />
    </div>
  );
};

export default TourPriceViewDemo;
