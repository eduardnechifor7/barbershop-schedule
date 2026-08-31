import { useState, useEffect } from "react";
import { appointmentService } from "../../services/appointmentService.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";
import { ArrowLeft, Scissors, ChevronRight, Clock } from "lucide-react";
import { BottomNav } from "../../components/common/BottomNav.jsx";
import { useNavigate } from "react-router-dom";
import { AppointmentDetailsModal } from "../../components/modals/AppointmentDetailsModal.jsx";
import { STATUS_ICON_STYLES } from "../../constants/selectStyles.js";
import { ErrorScreen } from "../../components/common/ErrorScreen.jsx";


export function PastAppointments() {
    const [pastAppointments, setPastAppointments] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        const fetchPastAppointments = async () => {
            try {
                setError(null);
                const appointmentsData = await appointmentService.getByUser();
                const pastAppointmentsData = appointmentsData.filter(appointment => appointment.status === "completed" || appointment.status === "cancelled");
                setPastAppointments(pastAppointmentsData);
            } catch (error) {
                setError("Failed to load appointments.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };
        void fetchPastAppointments();

        return () => {
            controller.abort();
        }
    }, [refreshTrigger]);

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setOpenDetailsModal(true);
    };

    if (error) {
        return (
            <ErrorScreen
                errorText={error}
                onRetry={() => setRefreshTrigger(prev => prev + 1)}
            />
        );
    }

    if (isLoading) {
        return (
            <LoadingSpinner label="Loading Past Appointments..." />
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#121212] text-[#F2EFE9] overflow-hidden select-none">

            <div className="bg-[#121212] px-5 pt-6 pb-5 flex items-center gap-3 shrink-0 border-b border-white/5 z-10">
                <button
                    onClick={() => navigate("/customer")}
                    className="w-9 h-9 rounded-xl bg-[#1C1B1B] border border-white/10 flex items-center justify-center hover:bg-white/2 transition-colors cursor-pointer"
                >
                    <ArrowLeft size={17} className="text-[#F2EFE9]" />
                </button>
                <div>
                    <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">History</p>
                    <h1 className="text-xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Past Appointments
                    </h1>
                </div>
            </div>

            {pastAppointments.length === 0 ? (
                <div className="text-center py-12 text-gray-400 flex-1 flex flex-col justify-center items-center">
                    <Clock size={32} className="mx-auto mb-2 opacity-40 text-gray-500" />
                    <p className="text-sm">No past appointments found.</p>
                </div>
            ) : (
                <div
                    className="flex-1 overflow-y-auto"
                    style={{ scrollbarWidth: "none" }}
                >
                    <div className="flex flex-col gap-3 px-5 pt-5 pb-28 space-y-4">
                        {pastAppointments.map((appt) => (
                            <button
                                onClick={() => handleAppointmentClick(appt)}
                                key={appt.appointment_id}
                                className="bg-[#1C1B1B] rounded-2xl px-4 py-3.5 border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/2 hover:border-white/10 transition-colors text-left"
                            >
                                <div
                                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                                        STATUS_ICON_STYLES[appt.status] || "bg-[#262424] text-gray-400"
                                    }`}
                                >
                                    <Scissors size={16} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-white text-sm font-medium truncate">
                                            {appt.services[0]?.service_name + " (" + new Date(appt.appointment_date).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) + ")" || "Service Name"}
                                        </p>
                                        <span className="text-gray-400 text-sm font-medium ml-2 shrink-0">
                                                    {appt.services[0]?.price_at_booking || "0"} RON
                                                </span>
                                    </div>
                                </div>

                                <ChevronRight
                                    size={15}
                                    className="text-gray-500 shrink-0 group-hover:text-gray-400 transition-colors"
                                />
                            </button>
                        ))}
                    </div>
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