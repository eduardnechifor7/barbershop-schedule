import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Smartphone,
    Trash2, AlertCircle, AlertTriangle
} from "lucide-react";
import { BottomNav } from "../components/BottomNav.jsx";
import { LoadingSpinner } from "../components/LoadingSpinner.jsx";
import { userService } from "../services/userService.js";
import { PhoneChangeModal } from "../components/PhoneChangeModal.jsx";
import { firebaseConfig } from "../firebase.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { initializeApp, getApps } from "firebase/app";

const tempApp = getApps().find(app => app.name === "PhoneVerificationApp")
    || initializeApp(firebaseConfig, "PhoneVerificationApp");

const tempAuth = getAuth(tempApp);

export function SecurityPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const passedUser = location.state?.user;
    const [loading, setLoading] = useState(!passedUser);
    const [user, setUser] = useState(passedUser || {
        phone_number: "",
        created_at: ""
    });
    const [openPhoneChangeModal, setOpenPhoneChangeModal] = useState(false);

    const handleSubmitPhoneChange = async (newPhoneNumber) => {
        console.log(user.id);
        try {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }

            window.recaptchaVerifier = new RecaptchaVerifier(tempAuth, "recaptcha-container", {
                size: "invisible"
            });

            const confirmationResult = await signInWithPhoneNumber(
                tempAuth,
                newPhoneNumber,
                window.recaptchaVerifier
            );

            window.confirmationResult = confirmationResult;

            navigate("/welcome/otp", {
                state: {
                    userId: user.id,
                    phone: newPhoneNumber,
                    phoneChange: true
                }
            });
        } catch (err) {
            console.error("Eroare la SMS:", err);
        }
    }

    useEffect(() => {
        if (!passedUser) {
            const fetchProfile = async () => {
                try {
                    const data = await userService.getProfile();
                    setUser(data);
                } catch (error) {
                    console.error("Error fetching user profile:", error);
                } finally {
                    setLoading(false);
                }
            };
            fetchProfile();
        }
    }, [passedUser]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="flex flex-col h-screen h-[100dvh] bg-[#121212] text-[#F2EFE9] overflow-hidden select-none">
            {/* Header */}
            <div className="bg-[#121212] px-6 pt-4 pb-3 shrink-0 border-b border-white/5 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-2xl bg-[#1C1B1B] border border-white/5 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                        SECURITY SETTINGS
                    </p>
                    <h1
                        className="text-3xl font-bold leading-tight mt-1 text-[#F2EFE9]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Security & Access
                    </h1>
                </div>
            </div>

            {/* Scrollable Content */}
            <div
                className="flex-1 min-h-0 overflow-y-auto px-5 py-6 pb-24 space-y-6"
                style={{ scrollbarWidth: "none" }}
            >
                {/* 1. Primary Authentication & Change Phone */}
                <div className="bg-[#1C1B1B] rounded-3xl p-5 border border-white/5 space-y-4">
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                        PRIMARY LOGIN METHOD
                    </p>

                    <div className="p-4 rounded-2xl bg-[#262424] border border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#DBB668]">
                                <Smartphone size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Registered Phone</p>
                                <p className="text-sm font-semibold text-white tracking-wide mt-0.5">
                                    {user.phone_number || "+40 ••• ••• •••"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setOpenPhoneChangeModal(true);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-[#DBB668]/15 border border-[#DBB668]/30 text-[#DBB668] text-xs font-semibold hover:bg-[#DBB668]/25 transition-all cursor-pointer"
                        >
                            Change
                        </button>
                    </div>

                    {/* Note Box */}
                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-2xl bg-white/[0.02] border border-white/5 text-gray-400 text-xs leading-relaxed">
                        <AlertCircle size={15} className="text-[#DBB668] shrink-0 mt-0.5" />
                        <p>
                            You'll be required to log in again after OTP verification.
                        </p>
                    </div>
                </div>

                {/* 2. Danger Zone (Account Deletion) */}
                <div className="bg-[#1C1B1B] rounded-3xl p-5 border border-red-500/10 space-y-4">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={15} className="text-red-400" />
                        <p className="text-red-400 text-[11px] font-bold uppercase tracking-wider">
                            DANGER ZONE
                        </p>
                    </div>

                    <div>
                        <p className="text-sm font-semibold text-white">Delete Account</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed mt-0.5">
                            Permanently remove your profile, booking history, and active appointments.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            /* Confirmation delete account */
                        }}
                        className="w-full py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 font-bold text-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                        <Trash2 size={15} />
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Bottom Nav */}
            <div className="shrink-0 z-40">
                <BottomNav />
            </div>
            <PhoneChangeModal
                isOpen={openPhoneChangeModal}
                onClose={() => setOpenPhoneChangeModal(false)}
                onSubmit={handleSubmitPhoneChange}
            />

            <div id="recaptcha-container" className="fixed bottom-0 right-0 pointer-events-none opacity-0"></div>
        </div>
    );
}