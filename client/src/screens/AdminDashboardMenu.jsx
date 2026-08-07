import { signOut } from "firebase/auth";
import { auth } from "../firebase.js";
import {useNavigate} from "react-router-dom";
import { User, Scissors, Calendar, FileText, ArrowRight } from "lucide-react";


export function AdminDashboardMenu() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            console.log("Logged out");
            navigate("/");
        } catch (error) {
            console.log("Error in logging out: ", error.message);
            alert("Something went wrong, try again.");
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg p-6 flex flex-col items-center justify-center">
            <div className="text-center mb-8">
                <p className="text-xs uppercase tracking-widest text-gray-pc mb-1">Admin Portal</p>
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
                    className="w-full py-3 text-xs font-medium text-gray-pc hover:text-white transition-colors"
                >
                    Log out
                </button>
            </div>
        </div>
    );
}