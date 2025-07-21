import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import { TourPrices } from "../components/TourPrices";

export default function Pricing() {
    return (
        <div className="min-h-screen">
            <TopBar />
            <NavBar textDark={true} />
            <TourPrices />
        </div>
    );

}