import { useState, useEffect } from "react";
import { barberService } from "../services/barberService.js";
import { servicesService } from "../services/servicesService.js";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../components/BottomNav.jsx";
import { User, ArrowRight, Scissors, Clock, ChevronRight } from "lucide-react";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";


export function CustomerExplore() {
    const [loading, setLoading] = useState(true);
    const [barbers, setBarbers] = useState([]);
    const [services, setServices] = useState([]);
    const [activeTab, setActiveTab] = useState("masters"); // "masters" or "services"
    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [barbersData, servicesData] = await Promise.all([
                    barberService.getAll?.() || [],
                    servicesService.getAll?.() || []
                ]);
                setBarbers(barbersData);
                setServices(servicesData);
            } catch (error) {
                console.error("Error loading explore data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const featuredService = services.reduce((max, s) => (s.price > max.price ? s : max), { price: 0 });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="flex flex-col h-screen h-[100dvh] bg-[#121212] text-[#F2EFE9] overflow-hidden select-none">

            {/* Header */}
            <div className="bg-[#121212] px-6 pt-6 pb-4 shrink-0 border-b border-white/5">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                    DISCOVER
                </p>
                <h1
                    className="text-3xl font-bold leading-tight mt-1 text-[#F2EFE9]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Explore & Learn
                </h1>

                <div className="flex bg-[#1E1E1E] p-1.5 rounded-2xl mt-5 border border-white/5 gap-1.5">
                    <button
                        onClick={() => setActiveTab("masters")}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                            activeTab === "masters"
                                ? "bg-[#DBB668] text-[#121212] shadow-sm"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Our Masters
                    </button>
                    <button
                        onClick={() => setActiveTab("services")}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                            activeTab === "services"
                                ? "bg-[#DBB668] text-[#121212] shadow-sm"
                                : "text-gray-400 hover:text-white"
                        }`}
                    >
                        Services Menu
                    </button>
                </div>
            </div>

            {/* Scrollable Content */}
            <div
                className="flex-1 min-h-0 overflow-y-auto px-5 py-5 pb-24 space-y-4"
                style={{ scrollbarWidth: "none" }}
            >
                {activeTab === "masters" && (
                    <div className="space-y-4 animate-fade-in">
                        {barbers.map((barber) => {
                            const tags = barber.skills;

                            return (
                                <div
                                    key={barber.id}
                                    className="bg-[#1C1B1B] rounded-3xl p-5 border border-white/5 space-y-4"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3.5 items-center">
                                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-[#262424] border border-white/10 flex items-center justify-center shrink-0">
                                                {barber.photo_url ? (
                                                    <img
                                                        src={barber.photo_url}
                                                        alt={barber.first_name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={24} className="text-gray-400" />
                                                )}
                                                <span className="absolute bottom-1 right-1 w-3 h-3 bg-[#10B981] border-2 border-[#1C1B1B] rounded-full" />
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-lg text-white leading-tight">
                                                    {barber.first_name} {barber.last_name}
                                                </h3>
                                                <p className="text-xs text-brand-gold font-medium mt-0.5">
                                                    {tags?.[0]?.name || "Master Barber"}
                                                </p>
                                                <p className="text-[11px] text-gray-400 mt-1">
                                                    Available for booking
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((skill) => (
                                            <span
                                                key={skill.id}
                                                className="text-xs bg-[#262424] text-gray-300 px-3.5 py-1.5 rounded-xl border border-white/5 font-medium"
                                            >
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>

                                    {/* CTA */}
                                    <button
                                        onClick={() => navigate("/bookings", {
                                            state: {
                                                preselectedBarber: barber.id
                                            }
                                        })}
                                        className="w-full py-3.5 rounded-2xl bg-[#DBB668] text-[#121212] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#c9a458] transition-all active:scale-[0.98] cursor-pointer"
                                    >
                                        Book with {barber.first_name}
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === "services" && (
                    <div className="space-y-4 animate-fade-in">
                        {featuredService && (
                            <div className="bg-[#1C1B1B] rounded-3xl p-6 border-2 border-[#DBB668]/40 space-y-4 shadow-xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-bold tracking-widest text-[#DBB668] bg-[#DBB668]/15 px-2.5 py-1 rounded-md uppercase border border-[#DBB668]/30">
                                            FEATURED EXPERIENCE
                                        </span>
                                        <h2
                                            className="text-2xl font-bold text-[#F2EFE9] mt-2.5"
                                            style={{ fontFamily: "'Playfair Display', serif" }}
                                        >
                                            {featuredService.service_name}
                                        </h2>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {featuredService.description || "The full complete grooming experience."}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                        <span className="text-2xl font-bold text-[#DBB668]">
                                            {featuredService.price} <span className="text-xs font-normal">RON</span>
                                        </span>
                                        <p className="text-xs text-gray-400">
                                            {featuredService.minutes_duration} min
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate("/bookings", {
                                        state: {
                                            preselectedServices: [featuredService.service_id]
                                        }
                                    })}
                                    className="w-full py-3.5 rounded-2xl bg-[#DBB668] text-[#121212] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#c9a458] transition-all active:scale-[0.98] cursor-pointer"
                                >
                                    Reserve this Service
                                    <ArrowRight size={16} />
                                </button>
                            </div>
                        )}

                        {services.map((service) => (
                            <div
                                key={service.service_id}
                                className="bg-[#1C1B1B] rounded-2xl p-4 border border-white/5 flex items-center justify-between gap-3 hover:border-white/10 transition-colors"
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-[#262424] border border-white/5 flex items-center justify-center shrink-0">
                                        <Scissors size={20} className="text-[#DBB668]" />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-bold text-sm text-white truncate">
                                            {service.service_name}
                                        </h4>
                                        <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                            {service.description || "Professional styling and finish."}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Clock size={12} />
                                            <span>{service.minutes_duration} min</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                    <span className="font-bold text-base text-[#DBB668]">
                                        {service.price} <span className="text-xs font-normal">RON</span>
                                    </span>
                                    <button
                                        onClick={() => navigate("/bookings", {
                                            state: {
                                                preselectedServices: [service.service_id]
                                            }
                                        })}
                                        className="text-xs text-gray-400 hover:text-[#DBB668] flex items-center gap-0.5 transition-colors cursor-pointer"
                                    >
                                        Book <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Nav */}
            <div className="shrink-0 z-40">
                <BottomNav />
            </div>
        </div>
    );
}