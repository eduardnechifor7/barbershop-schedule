import { signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { User, Scissors, Calendar, FileText, ArrowRight, Sparkles } from "lucide-react";
import { auth } from "../../firebase.js";
import { userService } from "../../services/userService.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";
import { Toast } from "../../components/common/Toast.jsx";
import { ErrorScreen } from "../../components/common/ErrorScreen.jsx";

export function AdminDashboardMenu() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, onRefreshTrigger] = useState(0);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    setError(null);
                    const userData = await userService.getProfile();
                    setUser(userData);
                } catch (error) {
                    setError("Failed to load your page. Please try again later.");
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [refreshTrigger]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/");
        } catch (error) {
            setToast({
                isOpen: false,
                message: "Failed to log out. Please try again.",
                type: "error"
            });
        }
    };

    if (error) {
        return (
            <ErrorScreen
                errorText={error}
                onRetry={() => setRefreshTrigger(prev => prev + 1)}
            />
        );
    }

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    if (user?.role === "Barber") {
        return (
            <div className="min-h-screen bg-dark-bg p-6 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Barber Portal</p>
                    <h1 className="text-3xl font-bold text-[#F2EFE9]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Staff Dashboard
                    </h1>
                </div>

                <div className="grid grid-cols-1 gap-4 w-full max-w-sm mb-6">
                    <button
                        onClick={() => navigate("/admin/appointments-barber")}
                        className="bg-[#2D2B2B] p-5 rounded-2xl border border-white/5 flex items-center justify-start gap-4 hover:border-[#DBB668]/40 hover:bg-[#383535] transition-all group"
                    >
                        <div className="p-3 rounded-xl bg-white/5 text-[#DBB668] group-hover:scale-105 transition-transform">
                            <Calendar size={24} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-sm font-semibold text-[#F2EFE9]">My Schedule & Clients</h3>
                            <p className="text-xs text-gray-400">View appointments & client details</p>
                        </div>
                    </button>
                </div>

                <div className="w-full max-w-sm space-y-3">
                    <button
                        onClick={() => navigate("/customer")}
                        className="w-full py-3.5 px-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-500/20 transition-all"
                    >
                        <span>Switch to Customer View</span>
                        <ArrowRight size={16} />
                    </button>

                    <button
                        onClick={handleLogout}
                        className="w-full py-3 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Log out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-dark-bg p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">Admin Portal</p>
                <h1 className="text-3xl font-bold text-[#F2EFE9]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Management Dashboard
                </h1>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-6">
                <button onClick={() => navigate("/admin/users")} className="bg-[#2D2B2B] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 hover:border-[#DBB668]/40 transition-all">
                    <User className="text-[#DBB668]" size={24} />
                    <span className="text-xs font-semibold text-[#F2EFE9]">Users</span>
                </button>

                <button onClick={() => navigate("/admin/barbers")} className="bg-[#2D2B2B] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 hover:border-[#DBB668]/40 transition-all">
                    <Scissors className="text-[#DBB668]" size={24} />
                    <span className="text-xs font-semibold text-[#F2EFE9]">Barbers</span>
                </button>

                <button onClick={() => navigate("/admin/appointments")} className="bg-[#2D2B2B] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 hover:border-[#DBB668]/40 transition-all">
                    <Calendar className="text-[#DBB668]" size={24} />
                    <span className="text-xs font-semibold text-[#F2EFE9]">Appointments</span>
                </button>

                <button onClick={() => navigate("/admin/services")} className="bg-[#2D2B2B] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 hover:border-[#DBB668]/40 transition-all">
                    <FileText className="text-[#DBB668]" size={24} />
                    <span className="text-xs font-semibold text-[#F2EFE9]">Services</span>
                </button>

                <div className="col-span-2 flex justify-center">
                    <button
                        onClick={() => navigate("/admin/skills")}
                        className="w-[calc(50%-0.5rem)] bg-[#2D2B2B] p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center gap-2 hover:border-[#DBB668]/40 transition-all"
                    >
                        <Sparkles className="text-[#DBB668]" size={24} />
                        <span className="text-xs font-semibold text-[#F2EFE9]">Skills</span>
                    </button>
                </div>
            </div>

            <div className="w-full max-w-sm space-y-3">
                <button
                    onClick={() => navigate("/customer")}
                    className="w-full py-3.5 px-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-amber-500/20 transition-all"
                >
                    <span>Switch to Customer View</span>
                    <ArrowRight size={16} />
                </button>

                <button
                    onClick={handleLogout}
                    className="w-full py-3 text-xs font-medium text-gray-400 hover:text-white transition-colors"
                >
                    Log out
                </button>
            </div>

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isOpen: false}))}
            />
        </div>
    );
}