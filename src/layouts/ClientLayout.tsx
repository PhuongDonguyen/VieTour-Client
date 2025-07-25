import { Outlet } from "react-router-dom";
import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import { Footer } from "../layouts/Footer";

export default function ClientLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <NavBar textDark={true} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
} 