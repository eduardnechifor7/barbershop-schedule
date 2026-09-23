import { useEffect, useState, useMemo } from "react";
import {
    CalendarDays,
    Clock,
    Scissors,
    ChevronRight,
    Bell,
    X,
    ShieldCheck,
    User
} from "lucide-react";
import { appointmentService } from "../../services/appointmentService.js";
import { userService } from "../../services/userService.js";
import { notificationService } from "../../services/notificationService.js";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";
import { auth } from "../../firebase.js";
import { BottomNav } from "../../components/common/BottomNav.jsx";
import { ConfirmModal } from "../../components/modals/ConfirmModal.jsx";
import { AppointmentDetailsModal } from "../../components/modals/AppointmentDetailsModal.jsx";
import { NotificationsModal } from "../../components/modals/NotificationsModal.jsx";
import { STATUS_ICON_STYLES } from "../../constants/selectStyles.js";
import { ErrorScreen } from "../../components/common/ErrorScreen.jsx";
import { Toast } from "../../components/common/Toast.jsx";

export function CustomerHome() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(false);
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openModal, setOpenModal] = useState(null); // "notifications" | "details" | "confirm"

    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = auth.onAuthStateChanged(async (firebaseUser) => {
            if (!firebaseUser) return;

            setLoading(true);
            setError(null);
            try {
                const [appointmentsData, userData, notificationsData] = await Promise.all([
                    appointmentService.getByUser(),
                    userService.getProfile(),
                    notificationService.getUserNotifications()
                ]);
                setAppointments(appointmentsData);
                setUser(userData);
                setNotifications(notificationsData);
            } catch (error) {
                setError("Error fetching dashboard data");
            } finally {
                setLoading(false);
            }
        });
        return () => fetchDashboardData();
    }, [refreshTrigger]);

    const { lastAppointment, completedAppointments } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = appointments.find((appt) => {
            const isTargetStatus = appt.status === "scheduled";
            const isFutureOrToday = new Date(appt.appointment_date) >= today;
            return isTargetStatus && isFutureOrToday;
        }) || null;

        const completed = appointments.filter((appt) => appt.status === "completed");

        return {
            lastAppointment: upcoming,
            completedAppointments: completed
        };
    }, [appointments]);

    const handleConfirmCancel = async () => {
        if (!lastAppointment) return;
        setLoading(true);

        try {
            await appointmentService.deleteAsUser(lastAppointment.appointment_id);
            setOpenModal(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            Sentry.captureException(error, { details: "Error cancelling appointment" });
        } finally {
            setLoading(false);
        }
    };

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setOpenModal("details");
    }

    const handleNotificationClick = async (notification) => {
        if (notification.is_read) {
            return;
        }

        const notificationId = notification.id;

        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prevNotifications => prevNotifications.map(notification =>
                notification.id === notificationId ? { ...notification, is_read: true } : notification
            ));
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to mark notification as read.",
                type: "error"
            });
        }
    }

    const handleMarkAllAsRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prevNotifications => prevNotifications.map(notification => ({
                ...notification,
                is_read: true
            })));
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to mark all notifications as read.",
                type: "error"
            });
        }
    }

    const handleDeleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== notificationId));
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to delete notification.",
                type: "error"
            });
        }
    }

    const unreadCount = useMemo(
        () => notifications.filter((n) => !n.is_read).length,
        [notifications]
    );

    if (loading) return <LoadingSpinner label="Loading dashboard..." />;

    if (error) {
        return (
            <ErrorScreen
                errorText={error}
                onRetry={() => setRefreshTrigger(prev => prev + 1)}
            />
        );
    }

    return (
        <div className="flex flex-col h-screen bg-[#121212] text-[#F2EFE9] overflow-hidden select-none">
            <div className="bg-[#121212] px-6 pt-6 pb-3 shrink-0 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                            WELCOME BACK
                        </p>
                        <h1
                            className="text-3xl font-bold leading-tight mt-1 text-[#F2EFE9]"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Hello, {user ? user.first_name : "User"}!
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {(user?.role === "Admin" || user?.role === "Barber") && (
                            <button
                                onClick={() => navigate("/admin")}
                                className="relative w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-brand-gold text-[#121212] transition-colors hover:bg-[#c9a155] cursor-pointer"
                                title="Admin Panel"
                            >
                                <ShieldCheck size={18} />
                            </button>
                        )}
                        <button
                            onClick={() => setOpenModal("notifications")}
                            className="relative w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-[#1C1B1B] text-gray-300 transition-colors hover:bg-white/5 cursor-pointer">
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-gold" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div
                className="flex-1 min-h-0 overflow-y-auto px-5 py-5 pb-24 space-y-6"
                style={{ scrollbarWidth: "none" }}
            >
                <button
                    onClick={() => navigate("/bookings")}
                    className="w-full rounded-2xl py-4 px-6 flex items-center justify-between group transition-all active:scale-[0.98] shrink-0 cursor-pointer shadow-lg shadow-black/20"
                    style={{ background: "linear-gradient(135deg, #DBB668 0%, #c9a155 100%)" }}
                >
                    <div className="text-left">
                        <p className="text-[#121212] text-xs font-semibold uppercase tracking-widest">
                            Ready for a fresh cut?
                        </p>
                        <p
                            className="text-[#121212] text-xl font-bold mt-0.5"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            Book an Appointment
                        </p>
                    </div>
                    <div className="w-11 h-11 rounded-full bg-[#121212]/15 flex items-center justify-center group-hover:bg-[#121212]/25 transition-colors">
                        <Scissors size={20} className="text-[#121212]" />
                    </div>
                </button>

                <section className="shrink-0">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-[#F2EFE9] text-base font-semibold">
                            Your Next Appointment
                        </h2>
                    </div>

                    {lastAppointment ? (
                        <div className="bg-[#1C1B1B] rounded-3xl overflow-hidden border border-white/5">
                            <div className="h-0.5 bg-linear-to-r from-brand-gold via-[#c9a155] to-transparent" />
                            <div className="p-5">
                                <div className="flex gap-4 items-start">
                                    <div className="relative shrink-0">
                                        {lastAppointment.barber_photo_url ? (
                                            <img
                                                src={lastAppointment.barber_photo_url}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#262424] border border-white/10 flex items-center justify-center text-brand-gold">
                                                <User size={18} />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-brand-gold text-[#121212] rounded-full flex items-center justify-center">
                                            <Scissors size={10} />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-white font-semibold text-base leading-tight">
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
                                                <CalendarDays size={13} className="text-gray-400" />
                                                <span className="text-gray-400 text-xs">
                                                    {new Date(lastAppointment.appointment_date).toLocaleDateString('en-GB', {
                                                        day: 'numeric',
                                                        month: 'long'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={13} className="text-gray-400" />
                                                <span className="text-gray-400 text-xs">
                                                    {lastAppointment?.start_time?.slice(0, 5) || "00:00"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 mb-3 border-t border-white/5" />

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setOpenModal("confirm")}
                                        className="flex-1 rounded-2xl py-2.5 text-sm font-semibold text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <X size={13} />
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-[#1C1B1B] rounded-3xl p-5 border border-white/5 flex flex-col items-center gap-2 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#262424] flex items-center justify-center mb-1 text-brand-gold">
                                <CalendarDays size={22} />
                            </div>
                            <p className="text-white font-semibold">No upcoming appointments</p>
                            <p className="text-gray-400 text-sm">Book your next cut to see it here.</p>
                            <button
                                onClick={() => navigate("/bookings")}
                                className="mt-1 px-5 py-2 rounded-xl text-sm font-semibold bg-brand-gold text-[#121212] transition-opacity hover:opacity-90 cursor-pointer"
                            >
                                Book Now
                            </button>
                        </div>
                    )}
                </section>

                <section className="flex flex-col flex-1 min-h-0">
                    <div className="flex items-center justify-between mb-3 shrink-0 px-1">
                        <h2 className="text-[#F2EFE9] text-base font-semibold">
                            Past Appointments
                        </h2>
                        <button
                            onClick={() => navigate("/past-appointments")}
                            className="flex items-center gap-0.5 text-brand-gold text-xs font-medium hover:underline cursor-pointer"
                        >
                            See all <ChevronRight size={14} />
                        </button>
                    </div>

                    <div
                        className="flex-1 overflow-y-auto space-y-3 pr-1"
                        style={{ scrollbarWidth: "none" }}
                    >
                        {completedAppointments.slice(0, 3).map((appt) => (
                            <button
                                key={appt.appointment_id}
                                onClick={() => handleAppointmentClick(appt)}
                                className="bg-[#1C1B1B] w-full rounded-2xl px-4 py-3.5 border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/2 hover:border-white/10 transition-colors text-left"
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
                </section>
            </div>

            <div className="shrink-0 z-40">
                <BottomNav />
            </div>
            {openModal === "notifications" && (
                <NotificationsModal
                    isOpen={true}
                    notifications={notifications}
                    onClose={() => setOpenModal(null)}
                    onNotificationClick={handleNotificationClick}
                    onMarkAllAsRead={handleMarkAllAsRead}
                    onDeleteNotification={handleDeleteNotification}
                />
            )}

            {openModal === "confirm" && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setOpenModal(null)}
                    onConfirm={handleConfirmCancel}
                    title="Cancel Appointment?"
                    message="Are you sure you want to cancel this appointment? This action cannot be undone."
                    confirmText="Yes, Cancel"
                    isLoading={loading}
                />
            )}

            {openModal === "details" && (
                <AppointmentDetailsModal
                    isOpen={true}
                    appointment={selectedAppointment}
                    onClose={() => setOpenModal(null)}
                />
            )}

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}