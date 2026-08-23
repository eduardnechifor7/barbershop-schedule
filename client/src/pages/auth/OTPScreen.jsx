import OTPInput from "react-otp-input";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "../../services/userService.js";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase.js";
import { Toast } from "../../components/common/Toast.jsx";

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

    const role = location.state?.role || "Customer";
    const phone = location.state?.phone || "";
    const userId = location.state?.userId || null;
    const phoneChange = location.state?.phoneChange || false;
    const registerData = location.state?.registerData || null;

    useEffect(() => {
        if (!window.confirmationResult && !phoneChange) {
            navigate("/", { replace: true });
        }
    }, [navigate, phoneChange]);

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

            if (phoneChange) {
                if (!auth.currentUser) {
                    throw new Error("No active session found. Please log in again.");
                }

                const result = await window.confirmationResult.confirm(otp);
                const verificationToken = await result.user.getIdToken();

                await userService.editPhoneNumber({
                    userId,
                    verificationToken,
                    phone
                });

                await signOut(auth);
                navigate("/", { replace: true });
                return;
            }

            const result = await window.confirmationResult.confirm(otp);
            const firebaseUser = result.user;

            if (registerData) {
                try {
                    await userService.addUser({
                        firebase_uid: firebaseUser.uid,
                        first_name: registerData.first_name,
                        last_name: registerData.last_name,
                        phone_number: firebaseUser.phoneNumber || phone,
                        email: registerData.email
                    });
                } catch (err) {
                    setToast({
                        isOpen: true,
                        message: "Failed to register user. Please try again.",
                        type: "error"
                    });
                    return;
                }
            }

            if (role === "Admin") {
                navigate("/admin", { replace: true });
            } else {
                navigate("/customer", { replace: true });
            }
        } catch (err) {
            setToast({
                isOpen: true,
                message: "Invalid verification code. Please try again.",
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
                                className="!w-12 !h-14 text-2xl text-center bg-white border border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold text-black focus:outline-none"
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
                    <span className="text-white text-sm font-semibold cursor-pointer hover:underline">
                        Resend
                    </span>
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