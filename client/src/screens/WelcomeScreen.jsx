import { AuthPhoneInput } from "../components/AuthPhoneInput.jsx";
import { isValidPhoneNumber } from 'react-phone-number-input';
import { useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton.jsx";
import appLogo from "../assets/cuthut_logo.png"
import { auth } from "../firebase.js";
import { useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export function WelcomeScreen() {
    const [phone, setPhone] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
            if (firebaseUser) {
                navigate('/customer', { replace: true });
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    useEffect(() => {
        if (import.meta.env.DEV) {
            auth.settings.appVerificationDisabledForTesting = true;
        }

        const initVerifier = () => {
            const container = document.getElementById('recaptcha-container');
            if (container && !window.recaptchaVerifier) {
                auth.config.siteKey = undefined;
                try {
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                        'size': 'invisible',
                        'callback': () => { }
                    });
                    window.recaptchaVerifier.render();
                } catch (err) {
                    console.error("Recaptcha init error:", err);
                }
            }
        };

        initVerifier();

        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {}
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';

        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';
            document.body.style.position = 'static';
            document.body.style.width = 'auto';
        };
    }, []);

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
            const response = await fetch(`http://localhost:8080/api/users/check/${phone}`);
            const data = await response.json();

            if (data.exists) {
                const appVerifier = window.recaptchaVerifier;
                window.confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
                navigate('/welcome/otp', { state: { phone, role: data.role } });
            } else {
                navigate('/register', { state: { phone } });
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong.");
        }

        setIsLoading(false);
    }

    return (
        <div className="animate-screen-in min-h-dvh flex flex-col justify-between py-12 w-full">
            <div className="flex flex-col justify-evenly items-center px-6">
                <div className="flex flex-col items-center gap-4">
                    <img src={appLogo} className="w-50 h-50 object-contain mb-4" alt="Cut Hut"/>
                    <div className="flex flex-col items-center justify-center">
                        <span className="text-white text-base font-bold">Welcome to Cut Hut</span>
                        <span className="text-white text-sm">Sign in or enter your details to get started</span>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-4">
                        <AuthPhoneInput value={phone} onChange={setPhone} />
                        {error && (
                            <p className="animate-error-shake text-red-500 text-xs font-medium">
                                • {error}
                            </p>
                        )}
                        <PrimaryButton
                            onClick={handleContinue}
                            isLoading={isLoading}
                            className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200"
                        >
                            Continue
                        </PrimaryButton>
                    </div>
                </div>
            </div>

            <p className="text-xs text-center text-gray-400 max-w-xs mx-auto leading-relaxed">
                By clicking continue, you agree to our
                <span className="text-white font-medium"> Terms of Service </span>
                and
                <span className="text-white font-medium"> Privacy Policy</span>
            </p>

            <div id="recaptcha-container" className="fixed bottom-0 right-0 pointer-events-none opacity-0"></div>
        </div>
    );
}