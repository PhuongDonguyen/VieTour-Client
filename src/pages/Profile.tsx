import { TopBar } from "../layouts/TopBar";
import { NavBar } from "../layouts/NavBar";
import {ProfilePage} from "../components/ProfileUser"

export default function Profile() {
    return (
        <div className="min-h-screen">
            <TopBar />
            <NavBar />
            <ProfilePage/>
        </div>
    );

}