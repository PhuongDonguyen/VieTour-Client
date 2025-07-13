import { TourByCategory } from "../components/TourByCategory";
import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";

export default function TourCategory() {
  return (
    <div className="min-h-screen">
      <TopBar/>
      <NavBar/>
      <TourByCategory/>
    </div>
  );
}