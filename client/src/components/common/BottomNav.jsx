import { Home, CalendarDays, Scissors, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const getActiveTab = () => {
        if (location.pathname.includes("/bookings")) return "appointments";
        if (location.pathname.includes("/explore")) return "explore";
        if (location.pathname.includes("/profile")) return "profile";
        return "home";
    };

    const activeTab = getActiveTab();

    const tabs = [
        { tab: "home", icon: Home, label: "Home", path: "/customer" },
        { tab: "appointments", icon: CalendarDays, label: "Bookings", path: "/bookings" },
        { tab: "explore", icon: Scissors, label: "Explore", path: "/explore" },
        { tab: "profile", icon: User, label: "Profile", path: "/profile" }
    ];

    return (
        <div
            className="fixed bottom-0 left-0 right-0 bg-[#1A1919] border-t border-white/5 z-20"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 12px)" }}
        >
            <div className="flex items-center justify-around px-4 pt-3 pb-4">
                {tabs.map(({ tab, icon: Icon, label, path }) => (
                    <button
                        key={tab}
                        onClick={() => navigate(path)}
                        className="flex flex-col items-center gap-1 group cursor-pointer"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                            activeTab === tab ? "bg-brand-gold/15" : "bg-transparent group-hover:bg-white/5"
                        }`}>
                            <Icon size={20} className={activeTab === tab ? "text-brand-gold" : "text-gray-pc"} />
                        </div>
                        <span className={`text-[10px] font-medium ${activeTab === tab ? "text-brand-gold" : "text-gray-pc"}`}>
                            {label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}