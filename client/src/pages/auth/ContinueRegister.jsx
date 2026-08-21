import { AuthPhoneInput } from "../../components/common/AuthPhoneInput.jsx";
import { useState } from "react";
import { auth } from "../../firebase.js";
import { signInWithPhoneNumber } from "firebase/auth";
import { validateFields, required, email as validateEmail, phone as validatePhone, textOnly } from "../../utils/validation.js";
import { useLocation, useNavigate } from "react-router-dom";
import { useRecaptcha } from "../../hooks/useRecaptcha.js";

export function ContinueRegister() {
    const navigate = useNavigate();
    const location = useLocation();
    useRecaptcha();

    const [form, setForm] = useState({
        phone: location.state?.phone || "",
        email: "",
        firstName: "",
        lastName: ""
    });
    const [formErrors, setFormErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState("");

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleRegister = async () => {
        setApiError("");

        const nextErrors = validateFields(form, {
            phone: [required, validatePhone],
            email: [required, validateEmail],
            firstName: [required, textOnly],
            lastName: [required, textOnly]
        });

        if (Object.keys(nextErrors).length > 0) {
            setFormErrors(nextErrors);
            return;
        }

        try {
            setIsLoading(true);
            setFormErrors({});

            const appVerifier = window.recaptchaVerifier;
            window.confirmationResult = await signInWithPhoneNumber(auth, form.phone, appVerifier);

            navigate("/welcome/otp", {
                state: {
                    phone: form.phone,
                    role: "Customer",
                    registerData: {
                        first_name: form.firstName,
                        last_name: form.lastName,
                        email: form.email
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

    const inputClasses = "block w-full border bg-white text-black text-sm placeholder:text-sm placeholder:text-gray-pc border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold p-2 hover:bg-[#e6edf0] focus:outline-none";

    return (
        <div className="min-h-screen">
            <div className="min-h-screen flex flex-col justify-evenly items-center px-6">
                <div className="flex flex-col items-center">
                    <span className="text-white text-base">Create an account</span>
                    <span className="text-white text-sm">Continue with your personal details</span>
                </div>

                <div className="flex flex-col justify-center items-center gap-4 w-full max-w-sm">
                    <div className="relative w-full flex flex-col gap-1">
                        <AuthPhoneInput
                            value={form.phone}
                            onChange={(val) => updateField("phone", val)}
                        />
                        {formErrors.phone && (
                            <p className="animate-error-shake text-red-400 text-xs font-medium">
                                • {formErrors.phone}
                            </p>
                        )}
                    </div>

                    <div className="w-full flex flex-col gap-1">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={(e) => updateField("email", e.target.value)}
                            className={inputClasses}
                        />
                        {formErrors.email && (
                            <p className="animate-error-shake text-red-400 text-xs font-medium">
                                • {formErrors.email}
                            </p>
                        )}
                    </div>

                    <div className="w-full flex flex-col gap-1">
                        <input
                            type="text"
                            placeholder="First name"
                            value={form.firstName}
                            onChange={(e) => updateField("firstName", e.target.value)}
                            className={inputClasses}
                        />
                        {formErrors.firstName && (
                            <p className="animate-error-shake text-red-400 text-xs font-medium">
                                • {formErrors.firstName}
                            </p>
                        )}
                    </div>

                    <div className="w-full flex flex-col gap-1">
                        <input
                            type="text"
                            placeholder="Last name"
                            value={form.lastName}
                            onChange={(e) => updateField("lastName", e.target.value)}
                            className={inputClasses}
                        />
                        {formErrors.lastName && (
                            <p className="animate-error-shake text-red-400 text-xs font-medium">
                                • {formErrors.lastName}
                            </p>
                        )}
                    </div>

                    {apiError && (
                        <p className="text-red-400 text-xs font-medium">{apiError}</p>
                    )}

                    <button
                        type="button"
                        onClick={handleRegister}
                        disabled={isLoading}
                        className="w-full p-2 rounded-lg font-bold text-base bg-brand-gold hover:bg-yellow-200 text-black focus:ring-4 focus:ring-yellow-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
                    >
                        {isLoading ? "Loading..." : "Create account"}
                    </button>
                </div>

                <div className="flex flex-row items-center justify-center gap-1">
                    <span className="text-gray-pc text-sm">Already have an account?</span>
                    <button
                        onClick={() => navigate("/")}
                        className="text-white text-sm hover:underline cursor-pointer"
                    >
                        Log in
                    </button>
                </div>
            </div>

            <div id="recaptcha-container" className="fixed bottom-0 right-0 pointer-events-none opacity-0"></div>
        </div>
    );
}