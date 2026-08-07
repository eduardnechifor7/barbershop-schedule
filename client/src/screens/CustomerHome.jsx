import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock,
    Scissors,
    User,
    ChevronRight,
    Bell,
    X,
    ShieldCheck
} from "lucide-react";
import { appointmentService } from "../services/appointmentService.js";
import { userService } from "../services/userService.js";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { auth } from "../firebase.js";
import { BottomNav } from "../components/BottomNav.jsx";
import { ConfirmModal } from "../components/ConfirmModal.jsx";

export function CustomerHome() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [user, setUser] = useState(null);
    const [isError, setIsError] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const navigate = useNavigate();
    const currentDate = new Date();

    useEffect(() => {
        const fetchDashboardData = auth.onAuthStateChanged(async (firebaseUser) => {
            if (!firebaseUser) return;

            setLoading(true);
            setIsError(false);
            try {
                const [appointmentsData, userData] = await Promise.all([
                    appointmentService.getByUser(),
                    userService.getProfile()
                ]);
                setAppointments(appointmentsData);
                setUser(userData);
            } catch (error) {
                setIsError(true);
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        });
        return () => fetchDashboardData();
    }, [refreshTrigger]);

    currentDate.setHours(0, 0, 0, 0);
    const lastAppointment = appointments.find(appt => appt.status === "scheduled" && (new Date(appt.appointment_date) >= currentDate)) || null;
    const completedAppointments = appointments.filter(appt => appt.status === "completed");
    const BARBER_PHOTO = lastAppointment ? lastAppointment.barber_photo_url : null;

    const handleConfirmCancel = async () => {
        if (!lastAppointment) return;
        setIsCancelling(true);

        try {
            await appointmentService.deleteAsUser(lastAppointment.appointment_id);
            setShowConfirmModal(false);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error cancelling appointment:", error);
        } finally {
            setIsCancelling(false);
        }
    };

    if (loading) return <LoadingSpinner label="Loading dashboard..." />;

    if (isError) {
        return (
            <div className="min-h-screen bg-dark-bg flex flex-col justify-center items-center p-6 text-center">
                <p className="text-[#F2EFE9] font-medium mb-2">Something went wrong</p>
                <p className="text-gray-pc text-sm mb-4">Could not load your appointment details.</p>
                <button
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="px-4 py-2 bg-[#DBB668] text-[#1A1919] font-semibold text-sm rounded-xl"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="animate-fade-in h-screen bg-dark-bg flex flex-col overflow-hidden">
            <div
                className="relative w-full h-full flex flex-col overflow-hidden"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                <div className="bg-[#1A1919] px-4 pb-4 pt-2 shrink-0">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-pc text-sm font-medium tracking-wide uppercase">
                                Welcome back
                            </p>
                            <h1
                                className="text-[#F2EFE9] text-3xl font-bold leading-tight mt-0.5"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Hello, {user ? user.first_name : "User"}!
                            </h1>
                        </div>
                        <div className="flex items-center gap-3">
                            {user?.role === "Admin" && (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className="relative w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-orange-400 transition-colors hover:bg-orange-500"
                                    title="Admin Panel"
                                >
                                    <ShieldCheck size={18} />
                                </button>
                            )}
                            <button className="relative w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-white/5 transition-colors hover:bg-white/10">
                                <Bell size={18} className="text-[#F2EFE9]" />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-gold" />
                            </button>
                            <div className="w-10 h-10 rounded-full bg-brand-gold flex items-center justify-center">
                                <User size={18} className="text-[#1A1919]" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#1A1919] -mb-px shrink-0">
                    <div className="bg-dark-bg rounded-t-3xl h-5" />
                </div>

                <div className="bg-background px-5 -mt-1 pb-24 flex flex-col flex-1 min-h-0 space-y-6">
                    <button
                        onClick={() => navigate("/bookings")}
                        className="w-full rounded-2xl py-4 px-6 flex items-center justify-between group transition-all active:scale-[0.98] shrink-0"
                        style={{ background: "linear-gradient(135deg, #DBB668 0%, #c9a155 100%)" }}
                    >
                        <div className="text-left">
                            <p className="text-[#1A1919] text-xs font-semibold uppercase tracking-widest">
                                Ready for a fresh cut?
                            </p>
                            <p
                                className="text-[#1A1919] text-xl font-bold mt-0.5"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Book an Appointment
                            </p>
                        </div>
                        <div className="w-11 h-11 rounded-full bg-[#1A1919]/15 flex items-center justify-center group-hover:bg-[#1A1919]/25 transition-colors">
                            <Scissors size={20} className="text-[#1A1919]" />
                        </div>
                    </button>

                    <section className="shrink-0">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-[#F2EFE9] text-base font-semibold">
                                Your Next Appointment
                            </h2>
                        </div>

                        {lastAppointment ? (
                            <div className="bg-card rounded-2xl overflow-hidden border border-white/5">
                                <div className="h-0.5 bg-linear-to-r from-brand-gold via-[#c9a155] to-transparent" />
                                <div className="p-4">
                                    <div className="flex gap-4 items-start">
                                        <div className="relative shrink-0">
                                            <img
                                                src={BARBER_PHOTO}
                                                alt="Barber"
                                                width={64}
                                                height={64}
                                                className="w-16 h-16 rounded-xl object-cover bg-[#333131]"
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center">
                                                <Scissors size={10} className="text-[#1A1919]" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-[#F2EFE9] font-semibold text-base leading-tight">
                                                        {`${lastAppointment.barber_first_name} ${lastAppointment.barber_last_name}`}
                                                    </p>
                                                    <p className="text-brand-gold text-sm font-medium mt-0.5">
                                                        {lastAppointment.services?.[0]?.service_name || "No service"}
                                                    </p>
                                                </div>
                                                <span className="text-brand-gold text-sm font-bold">
                                                    {lastAppointment?.services?.[0]?.price_at_booking} RON
                                                </span>
                                            </div>

                                            <div className="flex gap-4 mt-3">
                                                <div className="flex items-center gap-1.5">
                                                    <CalendarDays size={13} className="text-gray-pc" />
                                                    <span className="text-gray-pc text-xs">
                                                        {new Date(lastAppointment.appointment_date).toLocaleDateString('en-GB', {
                                                            day: 'numeric',
                                                            month: 'long'
                                                        })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={13} className="text-gray-pc" />
                                                    <span className="text-gray-pc text-xs">
                                                        {lastAppointment?.start_time?.slice(0, 5) || "00:00"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-4 mb-3 border-t border-white/5" />

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowConfirmModal(true)}
                                            className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-[#F2EFE9] border border-white/10 bg-white/5 hover:bg-white/10 transition-all active:scale-[0.97] flex items-center justify-center gap-1.5"
                                        >
                                            <X size={13} />
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-card rounded-2xl p-5 border border-white/5 flex flex-col items-center gap-2 text-center">
                                <div className="w-12 h-12 rounded-full bg-[#333131] flex items-center justify-center mb-1">
                                    <CalendarDays size={22} className="text-gray-pc" />
                                </div>
                                <p className="text-[#F2EFE9] font-semibold">No upcoming appointments</p>
                                <p className="text-gray-pc text-sm">Book your next cut to see it here.</p>
                                <button
                                    onClick={() => navigate("/bookings")}
                                    className="mt-1 px-5 py-2 rounded-xl text-sm font-semibold text-[#1A1919]"
                                    style={{ background: "#DBB668" }}
                                >
                                    Book Now
                                </button>
                            </div>
                        )}
                    </section>

                    <section className="flex flex-col flex-1 min-h-0">
                        <div className="flex items-center justify-between mb-3 shrink-0">
                            <h2 className="text-[#F2EFE9] text-base font-semibold">
                                Past Appointments
                            </h2>
                            <button
                                onClick={() => navigate("/past-appointments")}
                                className="flex items-center gap-0.5 text-brand-gold text-xs font-medium"
                            >
                                See all <ChevronRight size={14} />
                            </button>
                        </div>

                        <div
                            className="flex-1 overflow-y-auto space-y-3 pr-1"
                            style={{ scrollbarWidth: "none" }}
                        >
                            {completedAppointments.slice(0, 3).map((appt) => (
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
                    </section>
                </div>

                <BottomNav />
            </div>

            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Appointment?"
                message="Are you sure you want to cancel this appointment? This action cannot be undone."
                confirmText="Yes, Cancel"
                isLoading={isCancelling}
            />
        </div>
    );
}