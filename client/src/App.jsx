import { WelcomeScreen } from "./screens/WelcomeScreen.jsx";
import { Routes, Route } from "react-router-dom";
import { CustomerHome } from "./screens/CustomerHome.jsx";
import { CustomerBookings } from "./screens/CustomerBookings.jsx";
import { PastAppointments } from "./screens/PastAppointments.jsx";
import { OTPScreen } from "./screens/OTPScreen.jsx";
import { ContinueRegister } from "./screens/ContinueRegister.jsx";
import { AdminDashboardMenu } from "./screens/AdminDashboardMenu.jsx";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./components/LoadingSpinner.jsx";
import { AdminRoute } from "./components/AdminRoute.jsx"
import { userService } from "./services/userService.js";
import { auth } from "./firebase.js";
import { ManageUsers } from "./screens/ManageUsers.jsx";
import { ManageBarbers } from "./screens/ManageBarbers.jsx";
import { ManageAppointments } from "./screens/ManageAppointments.jsx";
import { ManageServices } from "./screens/ManageServices.jsx";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userData = await userService.getProfile();
                    setUser(userData);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <div className="min-h-screen w-full bg-dark-bg">
            <Routes>
                <Route path="/" element={<WelcomeScreen />} />
                <Route path="/register" element={<ContinueRegister />} />
                <Route path="/welcome/otp" element={<OTPScreen />} />

                <Route path="/admin" element={ <AdminRoute user={user} /> }>
                    <Route index element={<AdminDashboardMenu />} />
                    <Route path="users" element={<ManageUsers />} />
                    <Route path="barbers" element={<ManageBarbers />} />
                    <Route path="appointments" element={<ManageAppointments />} />
                    <Route path="services" element={<ManageServices />} />
                </Route>

                <Route path="past-appointments" element={<PastAppointments />} />
                <Route path="/customer" element={<CustomerHome />} />
                <Route path="/bookings" element={<CustomerBookings />} />
            </Routes>
        </div>
    );
}

export default App;