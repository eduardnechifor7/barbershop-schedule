import { useEffect, useState } from "react";
import { BottomNav } from "../../components/common/BottomNav.jsx";
import {
    Mail,
    Phone,
    Calendar,
    Scissors,
    User,
    Bell,
    ShieldCheck,
    HelpCircle,
    FileText,
    LogOut,
    ChevronRight
} from "lucide-react";
import { userService } from "../../services/userService.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";
import { useNavigate } from "react-router-dom";
import { NotificationsSettings } from "../../components/modals/NotificationsSettings.jsx";
import { HelpSupportModal } from "../../components/modals/HelpSupportModal.jsx";
import { TermsPolicyModal } from "../../components/modals/TermsPolicyModal.jsx";
import { ErrorScreen } from "../../components/common/ErrorScreen.jsx";
import { Toast } from "../../components/common/Toast.jsx";
import { supabase } from "../../supabase.js";

export function CustomerProfile() {
    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(false);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const [modalType, setModalType] = useState(""); // "edit" or "help" or "policy"
    const [openModal, setOpenModal] = useState(false);
    const [preferences, setPreferences] = useState({
        in_app_notifications: user?.in_app_notifications ?? true,
        email_notifications: user?.email_notifications ?? true,
        sms_notifications: user?.sms_notifications ?? true
    });
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });

    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();

        const fetchUserData = async () => {
            setError(null);
            try {
                setLoading(true);
                const userData = await userService.getProfile();
                setUser(userData);
                setPreferences({
                    in_app_notifications: userData.in_app_notifications,
                    email_notifications: userData.email_notifications,
                    sms_notifications: userData.sms_notifications
                });
            } catch (error) {
                setError("Failed to load your profile. Please try again.");
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        void fetchUserData();

        return () => {
            controller.abort();
        }
    }, [refreshTrigger])

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate("/");
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to log out. Please try again.",
                type: "error"
            });
        }
    };

    const editUser = async (key, formData) => {
        setPreferences((prevPreferences) => ({
            ...prevPreferences,
            [key]: formData
        }));
        try {
            await userService.updateNotifcationSettings({
                [key]: formData
            });
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to update notification settings.",
                type: "error"
            });
            setPreferences((prevPreferences) => ({
                ...prevPreferences,
                [key]: !formData
            }));
        }
    }

    if (error) {
        return (
            <ErrorScreen
                errorText={error}
                onRetry={() => setRefreshTrigger((prev) => prev + 1)}
            />
        );
    }

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <div className="flex flex-col min-h-dvh bg-[#121212] text-[#F2EFE9] overflow-hidden select-none">

            <div className="bg-[#121212] px-6 pt-6 pb-3 shrink-0 border-b border-white/5">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
                    ACCOUNT
                </p>
                <h1
                    className="text-3xl font-bold leading-tight mt-1 text-[#F2EFE9]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Profile & Settings
                </h1>
            </div>

            <div
                className="flex-1 min-h-0 overflow-y-auto px-5 py-5 pb-32 space-y-6"
                style={{ scrollbarWidth: "none" }}
            >
                <div className="bg-[#1C1B1B] rounded-3xl p-5 border border-white/5 flex items-center gap-4">
                    <div className="relative shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-brand-gold text-[#121212] flex items-center justify-center font-bold text-xl overflow-hidden border border-white/10">
                            {user.photo_url ? (
                                <img
                                    src={user.photo_url}
                                    alt={user.first_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{`${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()}</span>
                            )}
                        </div>
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                            <h2 className="font-bold text-lg text-white truncate">
                                {user.first_name} {user.last_name}
                            </h2>
                            <span className="text-[10px] font-bold tracking-wider text-brand-gold bg-brand-gold/15 px-2 py-0.5 rounded-md uppercase border border-brand-gold/30 shrink-0">
                                {user.role}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 truncate">
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                            <Phone size={12} className="shrink-0" />
                            <span>{user.phone_number}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#1C1B1B] rounded-3xl p-4 border border-white/5 flex flex-col justify-between">
                        <div className="w-9 h-9 rounded-xl bg-[#262424] flex items-center justify-center text-brand-gold">
                            <Calendar size={18} />
                        </div>
                        <div className="mt-4">
                            <span className="text-2xl font-bold text-white block leading-tight">
                                {user.total_appointments}
                            </span>
                            <span className="text-xs text-gray-400">Total Appointments</span>
                        </div>
                    </div>

                    <div className="bg-[#1C1B1B] rounded-3xl p-4 border border-white/5 flex flex-col justify-between">
                        <div className="w-9 h-9 rounded-xl bg-[#262424] flex items-center justify-center text-brand-gold">
                            <Scissors size={18} />
                        </div>
                        <div className="mt-4">
                            <span className="text-xl font-bold text-white block leading-tight truncate">
                                {user.favourite_barber}
                            </span>
                            <span className="text-xs text-gray-400">Favourite Barber</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider px-1">
                        ACCOUNT & PREFERENCES
                    </p>
                    <div className="bg-[#1C1B1B] rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                        <button
                            onClick = {() => navigate("personal-info", {
                                state: user
                            })}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/2 transition-colors cursor-pointer text-left">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#262424] flex items-center justify-center text-gray-300 shrink-0">
                                    <User size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white">Personal Information</p>
                                    <p className="text-xs text-gray-400 truncate">Edit name, phone number, email</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-500 shrink-0" />
                        </button>

                        <button
                            onClick = {() => {
                                setModalType("edit");
                                setOpenModal(true);
                            }}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/2 transition-colors cursor-pointer text-left">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#262424] flex items-center justify-center text-gray-300 shrink-0">
                                    <Bell size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white">Notifications & Reminders</p>
                                    <p className="text-xs text-gray-400 truncate">SMS & email reminders</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-500 shrink-0" />
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider px-1">
                        SECURITY & SUPPORT
                    </p>
                    <div className="bg-[#1C1B1B] rounded-3xl border border-white/5 divide-y divide-white/5 overflow-hidden">
                        <button
                            onClick = {() => navigate("security", {
                                state: user
                            })}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/2 transition-colors cursor-pointer text-left">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#262424] flex items-center justify-center text-gray-300 shrink-0">
                                    <ShieldCheck size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white">Security & Authentication</p>
                                    <p className="text-xs text-gray-400 truncate">Reset phone number, authentication</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-500 shrink-0" />
                        </button>

                        <button
                            onClick={() => {
                                setModalType("help");
                                setOpenModal(true);
                            }}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/2 transition-colors cursor-pointer text-left">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#262424] flex items-center justify-center text-gray-300 shrink-0">
                                    <HelpCircle size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white">Help & Support</p>
                                    <p className="text-xs text-gray-400 truncate">Salon contact, opening hours</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-500 shrink-0" />
                        </button>

                        <button
                            onClick={() => {
                                setModalType("policy");
                                setOpenModal(true);
                            }}
                            className="w-full p-4 flex items-center justify-between hover:bg-white/2 transition-colors cursor-pointer text-left">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-10 h-10 rounded-xl bg-[#262424] flex items-center justify-center text-gray-300 shrink-0">
                                    <FileText size={18} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white">Terms & Privacy Policy</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-gray-500 shrink-0" />
                        </button>
                    </div>
                </div>

                <button
                    onClick = {handleLogout}
                    className="w-full bg-[#1C1B1B] rounded-2xl p-4 border border-white/5 flex items-center justify-center gap-2.5 text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer">
                    <LogOut size={18} />
                    <span className="text-sm font-semibold">Log Out</span>
                </button>

                <p className="text-center text-[11px] text-gray-600">
                    v1.0.0 • barbershop-scheduler
                </p>
            </div>

            <div className="shrink-0 z-40">
                <BottomNav />
            </div>
            {modalType === "edit" && (
                <NotificationsSettings
                    isOpen={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setModalType("");
                    }}
                    preferences={preferences}
                    setUser={editUser}
                />
            )}

            {modalType === "help" && (
                <HelpSupportModal
                    isOpen={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setModalType("");
                    }}
                />
            )}

            {modalType === "policy" && (
                <TermsPolicyModal
                    isOpen={openModal}
                    onClose={() => {
                        setOpenModal(false);
                        setModalType("");
                    }}
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