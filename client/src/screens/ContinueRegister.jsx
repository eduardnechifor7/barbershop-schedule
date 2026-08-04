import { AuthInput } from "../components/AuthInput.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { AuthPhoneInput } from "../components/AuthPhoneInput.jsx";
import { OTPScreen } from "./OTPScreen.jsx";
import { useState } from "react";
import { auth } from "../firebase.js";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useEffect } from "react";
import { validateFields, required, email as validateEmail, phone as validatePhone, textOnly } from "../utils/validation.js";
import { userService } from "../services/userService.js";
import { useLocation, useNavigate } from "react-router-dom";

export function ContinueRegister() {
    const navigate = useNavigate();
    const location = useLocation();

    const [phone, setPhone] = useState(location.state?.phone || "");
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    useEffect(() => {

        if (import.meta.env.DEV) {
            auth.settings.appVerificationDisabledForTesting = true;
        }

        const container = document.getElementById('recaptcha-container');
        if (container && !window.recaptchaVerifier) {
            auth.config.siteKey = undefined;
            try {
                window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => {
                    }
                });
                window.recaptchaVerifier.render();
            } catch (err) {
                console.error("Recaptcha init error:", err);
            }
        }

        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {}
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    const handleRegister = async () => {
        setApiError("");

        const nextErrors = validateFields(
            { phone, email, firstName, lastName }, {
                 phone: [required],
                 email: [required, validateEmail],
                 firstName: [required, textOnly],
                 lastName: [required, textOnly]
            }
        );

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            return;
        }

        try {
            setIsLoading(true);
            setFormErrors({});

            const appVerifier = window.recaptchaVerifier;
            window.confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);

            navigate("/welcome/otp", {
                state: {
                    phone,
                    role: "Customer",
                    registerData: {
                        first_name: firstName,
                        last_name: lastName,
                        email: email
                    }
                },
                replace: true
            });
        } catch (error) {
            setApiError("Could not send SMS. Check the phone number.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="min-h-screen flex flex-col justify-evenly items-center px-6">
                <div className="flex flex-col items-center">
                    <span className="text-white text-base">Create an account</span>
                    <span className="text-white text-sm">Continue with your personal details</span>
                </div>
                <div className="flex flex-col justify-center items-center gap-4">
                    <div className="relative w-full flex flex-col gap-1">
                        <AuthPhoneInput
                            value={phone}
                            onChange={(val) => setPhone(val)}/>
                        {formErrors.phone && (
                            <p className="animate-error-shake text-red-500 text-xs font-medium">
                                • {formErrors.phone}
                            </p>
                        )}
                    </div>
                    <div className="w-full flex flex-col gap-1">
                        <AuthInput
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}/>
                        {formErrors.email && (
                            <p className="animate-error-shake text-red-500 text-xs font-medium">
                                • {formErrors.email}
                            </p>
                        )}
                    </div>
                    <div className="w-full flex flex-col gap-1">
                        <AuthInput
                            placeholder="First name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}/>
                        {formErrors.firstName && (
                            <p className="animate-error-shake text-red-500 text-xs font-medium">
                                • {formErrors.firstName}
                            </p>
                        )}
                    </div>
                    <div className="w-full flex flex-col gap-1">
                        <AuthInput
                            placeholder="Last name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}/>
                        {formErrors.lastName && (
                            <p className="animate-error-shake text-red-500 text-xs font-medium">
                                • {formErrors.lastName}
                            </p>
                        )}
                    </div>
                    <PrimaryButton onClick={handleRegister}
                                   className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200">Create
                        account</PrimaryButton>
                </div>
                <div className="flex flex-row items-center justify-center gap-1">
                    <span className="text-gray-pc text-sm">Already have an account?</span>
                    <span className="text-white text-sm">Log in</span>
                </div>
            </div>
            <div id="recaptcha-container" className="fixed bottom-0 right-0 pointer-events-none opacity-0"></div>
        </div>
    );
}