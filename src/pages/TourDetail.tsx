import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import TourDetail from "../components/tourDetail";

export default function TourDetailPage() {
  return (
    <div className="min-h-screen bg-white">
      <TopBar />
      <div className="navbar-custom-black">
        <NavBar />
      </div>
      <TourDetail />
    </div>
  );
} 