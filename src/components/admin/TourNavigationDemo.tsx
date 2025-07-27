import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, TrendingUp } from "lucide-react";

interface TourNavigationDemoProps {
  tourId: string;
  tourTitle: string;
}

const TourNavigationDemo: React.FC<TourNavigationDemoProps> = ({
  tourId,
  tourTitle,
}) => {
  const navigate = useNavigate();

  const handleNavigateToTourDetails = () => {
    navigate(`/admin/tours/details?tour_id=${tourId}`);
  };

  const handleNavigateToTourPrices = () => {
    navigate(`/admin/tours/prices?tour_id=${tourId}`);
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        onClick={handleNavigateToTourDetails}
        className="w-full"
      >
        <FileText className="w-4 h-4 mr-2" />
        View Tour Details
      </Button>

      <Button
        variant="outline"
        onClick={handleNavigateToTourPrices}
        className="w-full"
      >
        <TrendingUp className="w-4 h-4 mr-2" />
        View Tour Prices
      </Button>
    </div>
  );
};

export default TourNavigationDemo;
