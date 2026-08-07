import { useState, useEffect } from "react";
import { appointmentService } from "../services/appointmentService.js";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import {ArrowLeft, Scissors, ChevronRight} from "lucide-react";
import { BottomNav } from "../components/BottomNav.jsx";
import { useNavigate } from "react-router-dom";

//TODO: Each card should be clickable and lead to all the details of a past appointment.

export function PastAppointments() {
    const [pastAppointments, setPastAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPastAppointments = async () => {
            try {
                const appointmentsData = await appointmentService.getByUser();
                const pastAppointmentsData = appointmentsData.filter(appointment => appointment.status === "completed");
                setPastAppointments(pastAppointmentsData);
            } catch (error) {
                console.error("Error fetching past appointments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPastAppointments();
    }, []);

    if (isLoading) {
        return (
            <LoadingSpinner label="Loading Past Appointments..." />
        );
    }

    return (
        <div className="flex flex-col h-screen bg-dark-bg text-[#F2EFE9] overflow-hidden">
            {/* Header */}
            <div className="bg-[#1A1919] px-5 pt-6 pb-5 flex items-center gap-3 shrink-0">
                <button
                    onClick={() => navigate("/customer")}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                    <ArrowLeft size={17} className="text-[#F2EFE9]" />
                </button>
                <div>
                    <p className="text-gray-pc text-xs font-medium uppercase tracking-widest">History</p>
                    <h1 className="text-xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Past Appointments
                    </h1>
                </div>
            </div>

            {pastAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-pc">
                    <Clock size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No past appointments found.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3 px-5 py-4 overflow-y-auto">
                    {pastAppointments.map((appt) => (
                        <div
                            key={appt.id}
                            className="bg-card rounded-2xl px-4 py-3.5 border border-white/5 flex items-center gap-4 group cursor-pointer hover:border-white/10 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-xl bg-[#333131] flex items-center justify-center shrink-0">
                                <Scissors size={16} className="text-gray-pc" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <p className="text-[#F2EFE9] text-sm font-medium truncate">
                                        {appt.services[0]?.service_name + " (" + new Date(appt.appointment_date).toLocaleDateString('en-US', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        }) + ")" || "Service Name"}
                                    </p>
                                    <span className="text-gray-pc text-sm font-medium ml-2 shrink-0">
                                                {appt.services[0]?.price_at_booking || "0"} RON
                                            </span>
                                </div>
                            </div>

                            <ChevronRight
                                size={15}
                                className="text-gray-pc/50 shrink-0 group-hover:text-gray-pc transition-colors"
                            />
                        </div>
                    ))}
                </div>
            )}
            <div className="shrink-0 z-40">
                <BottomNav />
            </div>
        </div>
    );
}