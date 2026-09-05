import { AuthPhoneInput } from "../../components/common/AuthPhoneInput.jsx";
import { isValidPhoneNumber } from 'react-phone-number-input';
import { useState, useEffect } from "react";
import { auth } from "../../firebase.js";
import { signInWithPhoneNumber } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import appLogo from "../../assets/cuthut_logo.png";
import { TermsPolicyModal } from "../../components/modals/TermsPolicyModal.jsx";
import { useRecaptcha } from "../../hooks/useRecaptcha.js";
import { userService } from "../../services/userService.js";
import { Toast } from "../../components/common/Toast.jsx";

export function WelcomeScreen() {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);
    const [activeTab, setActiveTab] = useState(null);
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });

    const navigate = useNavigate();
    useRecaptcha();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                navigate('/customer', { replace: true });
            }
        });
        return () => unsubscribe();
    }, [navigate]);


    const handleContinue = async () => {
        setError("");
        if (!phone) {
            setError("This field is required");
            return;
        } else if (!isValidPhoneNumber(phone)) {
            setError("Please enter a valid phone number");
            return;
        }

        try {
            setIsLoading(true);
            const appVerifier = window.recaptchaVerifier;

            window.confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);

            navigate('/welcome/otp', { state: { phone } });
        } catch (err) {
            console.error("Firebase SMS error:", err);
            setToast({
                isOpen: true,
                message: "Failed to send verification code. Please try again later.",
                type: "error"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="animate-screen-in min-h-dvh flex flex-col justify-between py-12 w-full">
            <div className="flex flex-col justify-evenly items-center px-6">
                <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                    <img src={appLogo || ""} className="w-50 h-50 object-contain mb-4" alt="Cut Hut"/>

                    <div className="flex flex-col items-center justify-center text-center">
                        <span className="text-white text-base font-bold">Welcome to Cut Hut</span>
                        <span className="text-white text-sm">Sign in or enter your details to get started</span>
                    </div>

                    <div className="flex flex-col justify-center items-center gap-4 w-full">
                        <div className="w-full flex flex-col gap-1">
                            <AuthPhoneInput value={phone} onChange={setPhone} />
                            {error && (
                                <p className="animate-error-shake text-red-500 text-xs font-medium">
                                    • {error}
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleContinue}
                            disabled={isLoading}
                            className="w-full p-2 rounded-lg font-bold text-base bg-brand-gold hover:bg-yellow-200 text-black focus:ring-4 focus:ring-yellow-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                        >
                            {isLoading ? "Loading..." : "Continue"}
                        </button>
                    </div>
                </div>
            </div>

            <p className="text-xs text-center text-gray-400 max-w-xs mx-auto leading-relaxed">
                By clicking continue, you agree to our
                <button
                    onClick={() => {
                        setOpenModal(true);
                        setActiveTab("terms");
                    }}
                    className="text-white font-medium ml-1 hover:underline cursor-pointer"> Terms of Service </button>
                and
                <button
                    onClick={() => {
                        setOpenModal(true);
                        setActiveTab("privacy");
                    }}
                    className="text-white font-medium ml-1 hover:underline cursor-pointer"> Privacy Policy </button>
            </p>

            {openModal && activeTab && (
                <TermsPolicyModal
                    isOpen={openModal}
                    onClose={() => setOpenModal(false)}
                    activeTabProp={activeTab}
                />
            )}

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
            />

            <div id="recaptcha-container" className="fixed bottom-0 right-0 pointer-events-none opacity-0"></div>
        </div>
    );
}