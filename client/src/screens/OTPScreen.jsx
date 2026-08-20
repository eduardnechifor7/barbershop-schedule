import OTPInput from "react-otp-input";
import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { userService } from "../services/userService.js";
import {signOut} from "firebase/auth";
import {auth} from "../firebase.js";

export function OTPScreen () {
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    const role = location.state?.role || "Customer";
    const phone = location.state?.phone || "";
    const userId = location.state?.userId || null;
    const phoneChange = location.state?.phoneChange || false;
    const registerData = location.state?.registerData || null;

    useEffect (() => {
        if (!window.confirmationResult && !phoneChange) {
            navigate("/", { replace: true });
        }
    }, [navigate]);

    const handleVerify = async () => {
        if (otp.length < 6) {
            setError("Please enter the 6-digit code.");
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
                    console.error("Error adding user:", err);
                    setError("Failed to register user. Please try again.");
                    return;
                }
            }

            if (role === "Admin") {
                navigate("/admin", {replace: true});
            } else {
                navigate("/customer", {replace: true});
            }
        } catch (err) {
            console.error("OTP verification error:", err);
            setError("Invalid verification code. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-dvh flex flex-col justify-between px-6 py-8">
            <div className="flex flex-col justify-center gap-6 flex-1">
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
                                className="!w-12 !h-14 text-2xl text-center bg-white border border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold text-black"
                            />
                        )}
                    />
                </div>

                {error && (
                    <div className="flex flex-col gap-1 mb-4">
                        <p className="animate-error-shake text-red-400 text-xs font-medium text-center">
                            • {error}
                        </p>
                    </div>
                )}

                <PrimaryButton onClick={handleVerify}
                               isLoading={isLoading}
                               className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200">
                    Verify 6-Digit Code
                </PrimaryButton>

                <div className="flex flex-row items-center justify-center gap-1">
                    <span className="text-gray-pc text-sm">Didn't get a code?</span>
                    <span className="text-white text-sm font-semibold cursor-pointer">Resend</span>
                </div>
            </div>
        </div>
    );
}