import { Outlet, useLocation } from "react-router-dom";
import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import { Footer } from "../layouts/Footer";
import { Toaster } from "sonner";
import FloatingContactButtons from "../components/FloatingContactButtons";

export default function ClientLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <NavBar textDark={!isHomePage} />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster richColors position="top-right" />
      <FloatingContactButtons />
    </div>
  );
} 