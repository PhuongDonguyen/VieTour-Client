import TourDetail from "../components/tourDetail";
import {CommentSection} from "../components/question"

export default function TourDetailPage() {
  return (
    <div className="min-h-screen">
      <TourDetail />
      <CommentSection/>
    </div>
  );
} 