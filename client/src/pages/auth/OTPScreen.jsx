import OTPInput from "react-otp-input";
import { supabase } from "../../supabase.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "../../services/userService.js";
import { Toast } from "../../components/common/Toast.jsx";
import * as Sentry from "@sentry/react";

export function OTPScreen() {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });

    const navigate = useNavigate();
    const location = useLocation();

    const phone = location.state?.phone || "";
    const phoneChange = location.state?.phoneChange || false;

    useEffect(() => {
        if (!phone && !phoneChange) {
            navigate("/", { replace: true });
        }
    }, [navigate, phone, phoneChange]);

    const handleResend = async () => {
        if (!phone) return;
        try {
            const { error: resendErr } = await supabase.auth.signInWithOtp({ phone });
            if (resendErr) throw resendErr;
            setToast({
                isOpen: true,
                message: "Verification code sent again.",
                type: "success"
            });
        } catch (err) {
            setToast({
                isOpen: true,
                message: "Failed to resend verification code. Please wait a moment.",
                type: "error"
            });
        }
    };


    const handleVerify = async () => {
        if (otp.length < 6) {
            setToast({
                isOpen: true,
                message: "Please enter a 6-digit code.",
                type: "error"
            });
            return;
        }

        try {
            setIsLoading(true);
            setError("");

            const { data: authData, error: verifyError } = await supabase.auth.verifyOtp({
                phone,
                token: otp,
                type: "sms"
            });

            if (verifyError) {
                throw verifyError;
            }

            if (phoneChange) {
                const session = authData.session;
                if (!session) {
                    setToast({
                        isOpen: true,
                        message: "No active session found. Please log in again.",
                        type: "error"
                    });
                    return;
                }

                const { data, error } = await supabase.auth.verifyOtp({
                    phone,
                    token: otp,
                    type: "phone_change"
                });

                if (error) throw error;

                await userService.editPhoneNumber({
                    verificationToken: session.access_token
                });

                await supabase.auth.signOut();
                navigate("/", { replace: true });
                return;
            }

            try {
                const data = await userService.checkStatus();

                if (data.isRegistered) {
                    if (data.user.role === "Admin") {
                        navigate("/admin", { replace: true });
                    } else {
                        navigate("/customer", { replace: true });
                    }
                } else {
                    navigate('/register', { state: { phone }, replace: true });
                }
            } catch (error) {
                Sentry.captureException(error, { details: "Error during phone number verification" });
                setToast({
                    isOpen: true,
                    message: "Something went wrong.",
                    type: "error"
                });
            }
        } catch (err) {
            setToast({
                isOpen: true,
                message: "Something went wrong. Please try again.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex flex-col justify-between px-6 py-8">
            <div className="flex flex-col justify-center gap-6 flex-1 max-w-sm mx-auto w-full">
                <div className="flex flex-col items-center">
                    <span className="text-white text-base font-medium">Confirm it's you</span>
                    <span className="text-gray-400 text-sm mt-1">
                        Enter the verification code sent to{" "}
                        <span className="text-white font-medium">{phone || "your phone"}</span>
                    </span>
                </div>

                <div className="flex justify-center">
                    <OTPInput
                        value={otp}
                        onChange={(val) => {
                            setOtp(val);
                            if (error) setError("");
                        }}
                        numInputs={6}
                        renderSeparator={<span className="mx-1"></span>}
                        renderInput={(props) => (
                            <input
                                {...props}
                                inputMode="numeric"
                                className="w-12! h-14! text-2xl text-center bg-white border border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold text-black focus:outline-none"
                            />
                        )}
                    />
                </div>

                <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isLoading}
                    className="w-full p-2 rounded-lg font-bold text-base bg-brand-gold hover:bg-yellow-200 text-black focus:ring-4 focus:ring-yellow-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                >
                    {isLoading ? "Loading..." : "Verify 6-Digit Code"}
                </button>

                <div className="flex flex-row items-center justify-center gap-1">
                    <span className="text-gray-pc text-sm">Didn't get a code?</span>
                    <button
                        type="button"
                        onClick={handleResend}
                        className="text-white text-sm font-semibold cursor-pointer hover:underline bg-transparent border-none p-0"
                    >
                        Resend
                    </button>
                </div>
            </div>

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}