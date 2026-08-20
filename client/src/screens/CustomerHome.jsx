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
import { notificationService } from "../services/notificationService.js";
import { useNavigate } from "react-router-dom";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { auth } from "../firebase.js";
import { BottomNav } from "../components/BottomNav.jsx";
import { ConfirmModal } from "../components/ConfirmModal.jsx";
import { AppointmentDetailsModal } from "../components/AppointmentDetailsModal.jsx";
import { NotificationsModal } from "../components/NotificationsModal.jsx";

export function CustomerHome() {
    const [loading, setLoading] = useState(true);
    const [appointments, setAppointments] = useState([]);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [isError, setIsError] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [openNotificationsModal, setOpenNotificationsModal] = useState(false);
    const [openDetailsModal, setOpenDetailsModal] = useState(false);

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
                const [appointmentsData, userData, notificationsData] = await Promise.all([
                    appointmentService.getByUser(),
                    userService.getProfile(),
                    notificationService.getUserNotifications()
                ]);
                setAppointments(appointmentsData);
                setUser(userData);
                setNotifications(notificationsData);
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
    const lastAppointment = appointments.find(appt => (appt.status === "scheduled" || appt.status === "cancelled") && (new Date(appt.appointment_date) >= currentDate)) || null;
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

    const handleAppointmentClick = (appointment) => {
        setSelectedAppointment(appointment);
        setOpenDetailsModal(true);
    }

    const handleNotificationButton = () => {
        setOpenNotificationsModal(!openNotificationsModal);
    }

    const handleNotificationClick = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            setNotifications(prevNotifications => prevNotifications.map(notification =>
                notification.id === notificationId ? { ...notification, is_read: true } : notification
            ));
        } catch (error) {
            console.error("Error marking notification as read:", error);
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
            console.error("Error marking all notifications as read:", error);
        }
    }

    const handleDeleteNotification = async (notificationId) => {
        try {
            await notificationService.deleteNotification(notificationId);
            setNotifications(prevNotifications => prevNotifications.filter(notification => notification.id !== notificationId));
        } catch (error) {
            console.error("Error deleting notification:", error);
        }
    }

    const STATUS_ICON_STYLES = {
        completed: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
        cancelled: "bg-red-500/10 text-red-400 border border-red-500/20",
    };

    if (loading) return <LoadingSpinner label="Loading dashboard..." />;

    if (isError) {
        return (
            <div className="min-h-screen bg-[#121212] flex flex-col justify-center items-center p-6 text-center">
                <p className="text-[#F2EFE9] font-medium mb-2">Something went wrong</p>
                <p className="text-gray-400 text-sm mb-4">Could not load your appointment details.</p>
                <button
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="px-4 py-2 bg-[#DBB668] text-[#121212] font-semibold text-sm rounded-xl cursor-pointer"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen h-[100dvh] bg-[#121212] text-[#F2EFE9] overflow-hidden select-none">
            {/* Header */}
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
                                className="relative w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-[#DBB668] text-[#121212] transition-colors hover:bg-[#c9a155] cursor-pointer"
                                title="Admin Panel"
                            >
                                <ShieldCheck size={18} />
                            </button>
                        )}
                        <button
                            onClick={handleNotificationButton}
                            className="relative w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-[#1C1B1B] text-gray-300 transition-colors hover:bg-white/[0.05] cursor-pointer">
                            <Bell size={18} />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#DBB668]" />
                        </button>
                        <div className="w-10 h-10 rounded-full bg-[#DBB668] flex items-center justify-center text-[#121212]">
                            <User size={18} />
                        </div>
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
                            <div className="h-0.5 bg-gradient-to-r from-[#DBB668] via-[#c9a155] to-transparent" />
                            <div className="p-5">
                                <div className="flex gap-4 items-start">
                                    <div className="relative shrink-0">
                                        <img
                                            src={BARBER_PHOTO}
                                            alt="Barber"
                                            width={64}
                                            height={64}
                                            className="w-16 h-16 rounded-2xl object-cover bg-[#262424] border border-white/10"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#DBB668] text-[#121212] rounded-full flex items-center justify-center">
                                            <Scissors size={10} />
                                        </div>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-white font-semibold text-base leading-tight">
                                                    {`${lastAppointment.barber_first_name} ${lastAppointment.barber_last_name}`}
                                                </p>
                                                <p className="text-[#DBB668] text-sm font-medium mt-0.5">
                                                    {lastAppointment.services?.[0]?.service_name || "No service"}
                                                </p>
                                            </div>
                                            <span className="text-[#DBB668] text-sm font-bold">
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
                                        onClick={() => setShowConfirmModal(true)}
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
                            <div className="w-12 h-12 rounded-2xl bg-[#262424] flex items-center justify-center mb-1 text-[#DBB668]">
                                <CalendarDays size={22} />
                            </div>
                            <p className="text-white font-semibold">No upcoming appointments</p>
                            <p className="text-gray-400 text-sm">Book your next cut to see it here.</p>
                            <button
                                onClick={() => navigate("/bookings")}
                                className="mt-1 px-5 py-2 rounded-xl text-sm font-semibold bg-[#DBB668] text-[#121212] transition-opacity hover:opacity-90 cursor-pointer"
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
                            className="flex items-center gap-0.5 text-[#DBB668] text-xs font-medium hover:underline cursor-pointer"
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
                                className="bg-[#1C1B1B] w-full rounded-2xl px-4 py-3.5 border border-white/5 flex items-center gap-4 group cursor-pointer hover:bg-white/[0.02] hover:border-white/10 transition-colors text-left"
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
            <NotificationsModal
                isOpen={openNotificationsModal}
                notifications={notifications}
                onClose={() => setOpenNotificationsModal(false)}
                onNotificationClick={handleNotificationClick}
                onMarkAllAsRead={handleMarkAllAsRead}
                onDeleteNotification={handleDeleteNotification}
            />
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={handleConfirmCancel}
                title="Cancel Appointment?"
                message="Are you sure you want to cancel this appointment? This action cannot be undone."
                confirmText="Yes, Cancel"
                isLoading={isCancelling}
            />
            <AppointmentDetailsModal
                isOpen={openDetailsModal}
                appointment={selectedAppointment}
                onClose={() => setOpenDetailsModal(false)}
            />
        </div>
    );
}