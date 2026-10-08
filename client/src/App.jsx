import { WelcomeScreen } from "./pages/auth/WelcomeScreen.jsx";
import { Routes, Route } from "react-router-dom";
import { CustomerHome } from "./pages/customer/CustomerHome.jsx";
import { CustomerBookings } from "./pages/customer/CustomerBookings.jsx";
import { PastAppointments } from "./pages/customer/PastAppointments.jsx";
import { OTPScreen } from "./pages/auth/OTPScreen.jsx";
import { ContinueRegister } from "./pages/auth/ContinueRegister.jsx";
import { AdminDashboardMenu } from "./pages/admin/AdminDashboardMenu.jsx";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "./components/common/LoadingSpinner.jsx";
import { AdminRoute } from "./components/routing/AdminRoute.jsx"
import { userService } from "./services/userService.js";
import { ManageUsers } from "./pages/admin/ManageUsers.jsx";
import { ManageBarbers } from "./pages/admin/ManageBarbers.jsx";
import { ManageAppointments } from "./pages/admin/ManageAppointments.jsx";
import { ManageServices } from "./pages/admin/ManageServices.jsx";
import { ManageSkills } from "./pages/admin/ManageSkills.jsx";
import { CustomerExplore } from "./pages/customer/CustomerExplore.jsx";
import { CustomerProfile } from "./pages/customer/CustomerProfile.jsx";
import { PersonalInfoPage } from "./pages/customer/PersonalInfoPage.jsx";
import { ManageApptBarber } from "./pages/admin/ManageApptBarber.jsx";
import { SecurityPage } from "./pages/customer/SecurityPage.jsx";
import * as Sentry from "@sentry/react";
import { supabase } from "./supabase.js";

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                try {
                    const { isRegistered, user } = await userService.checkStatus();

                    if (isRegistered) {
                        setUser(user);
                    } else {
                        setUser(null);
                    }
                } catch (error) {
                    Sentry.captureException(error, { details: "Error fetching user profile" });
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
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

                <Route path="/admin" element={<AdminRoute user={user}/>}>
                    <Route index element={<AdminDashboardMenu/>}/>
                    <Route path="users" element={<ManageUsers/>}/>
                    <Route path="barbers" element={<ManageBarbers/>}/>
                    <Route path="appointments" element={<ManageAppointments/>}/>
                    <Route path="appointments-barber" element={<ManageApptBarber/>}/>
                    <Route path="services" element={<ManageServices/>}/>
                    <Route path="skills" element={<ManageSkills/>}/>
                </Route>

                <Route path="past-appointments" element={<PastAppointments />} />
                <Route path="/customer" element={<CustomerHome />} />
                <Route path="/bookings" element={<CustomerBookings />} />
                <Route path="/explore" element={<CustomerExplore />} />
                <Route path="/profile" element={<CustomerProfile />} />
                <Route path="/profile/personal-info" element={<PersonalInfoPage />} />
                <Route path="/profile/security" element={<SecurityPage />} />
            </Routes>
        </div>
    );
}

export default App;