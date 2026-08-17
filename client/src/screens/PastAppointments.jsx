import { useState, useEffect } from "react";
import { appointmentService } from "../services/appointmentService.js";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { ArrowLeft, Scissors, ChevronRight } from "lucide-react";
import { BottomNav } from "../components/BottomNav.jsx";
import { useNavigate } from "react-router-dom";
import { AppointmentDetailsModal } from "../components/AppointmentDetailsModal.jsx";


export function PastAppointments() {
    const [pastAppointments, setPastAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchPastAppointments = async () => {
            try {
                const appointmentsData = await appointmentService.getByUser();
                const pastAppointmentsData = appointmentsData.filter(appointment => appointment.status === "completed" || appointment.status === "cancelled");
                setPastAppointments(pastAppointmentsData);
            } catch (error) {
                console.error("Error fetching past appointments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPastAppointments();
    }, []);

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setOpenDetailsModal(true);
    };

    if (isLoading) {
        return (
            <LoadingSpinner label="Loading Past Appointments..." />
        );
    }

    const STATUS_ICON_STYLES = {
        completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
    };

    return (
        <div className="flex flex-col h-screen h-[100dvh] bg-dark-bg text-[#F2EFE9] overflow-hidden">
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
                <div className="flex flex-col gap-3 px-5 py-5 pb-24 space-y-4 overflow-y-auto">
                    {pastAppointments.map((appt) => (
                        <button
                            onClick={() => handleAppointmentClick(appt)}
                            key={appt.appointment_id}
                            className="bg-card rounded-2xl px-4 py-3.5 border border-white/5 flex items-center gap-4 group cursor-pointer hover:border-white/10 transition-colors"
                        >
                            <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                    STATUS_ICON_STYLES[appt.status] || "bg-[#333131] text-gray-pc"
                                }`}
                            >
                                <Scissors size={16} />
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
                        </button>
                    ))}
                </div>
            )}
            <div className="shrink-0 z-40">
                <BottomNav />
            </div>
            <AppointmentDetailsModal
                isOpen={openDetailsModal}
                appointment={selectedAppointment}
                onClose={() => setOpenDetailsModal(false)}
            />
        </div>
    );
}