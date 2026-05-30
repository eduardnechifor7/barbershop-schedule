import { AuthInput } from "../components/AuthInput.jsx";
import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { AuthPhoneInput } from "../components/AuthPhoneInput.jsx";
import { OTPScreen } from "./OTPScreen.jsx";
import { useState } from "react";
import { auth } from "../src/firebase.js";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useEffect } from "react";

export function ContinueRegister( { phoneValue } ) {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState(phoneValue);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpWindow, setOtpWindow] = useState(false);
    const [errors, setErrors] = useState([]);

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

    const sendData = async (firebaseUser) => {
        const userRegisterData = {
            firebase_uid: firebaseUser.uid,
            first_name: firstName,
            last_name: lastName,
            phone_number: firebaseUser.phoneNumber,
            email: email
        };

        try {
            const respone = await fetch("http://localhost:8080/api/users/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userRegisterData)
            });

            if (respone.ok) {
                console.log("User was added to database");
            }
        } catch (error) {
            console.log("Backend error: ", error);
        }
    };

    const validateEmail = (email) => {
        const emailPatten = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPatten.test(email);
    }

    const handleButton = async () => {
        setErrors([]);
        const errorsArr = [];
        // If OTP is not sent
        if (!isOtpSent) {
            if (!phone || !email || !firstName) {
                errorsArr.push("Please complete all fields");
                setErrors(errorsArr);
                return;
            } else if (!validateEmail(email)) {
                errorsArr.push("Please enter a valid email");
                setErrors(errorsArr);
                return;
            }

            try {
                const appVerifier = window.recaptchaVerifier;

                window.confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
                setIsOtpSent(true);
                setOtpWindow(true);
            } catch (error) {
                setOtpWindow(false);
                setErrors(["Could not send SMS. Check the phone number."]);
            }
        }
        // Verify the code and send data to database
        else {
            try {
                const result = await window.confirmationResult.confirm(otp);
                const firebaseUser = result.user;

                await sendData(firebaseUser);
            } catch (error) {
                errorsArr.push("Invalid code. Try again.");
                setErrors(errorsArr);
            }
        }
    };

    return (
        <div className="min-h-screen">
            {!otpWindow && (
                <div className="min-h-screen flex flex-col justify-evenly items-center px-6">
                    <div className="flex flex-col items-center">
                        <span className="text-white text-base">Create an account</span>
                        <span className="text-white text-sm">Continue with your personal details</span>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-4">
                        <div className="relative w-full">
                            <AuthPhoneInput
                                value={phone}
                                onChange={(val) => setPhone(val)} />
                        </div>
                        <AuthInput
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)} />
                        <AuthInput
                            placeholder="First name"
                            value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                        <AuthInput
                            placeholder="Last name"
                            value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        {errors.length > 0 && (
                            <div className="flex flex-col gap-1 mb-4">
                                {errors.map((err, index) => (
                                    <p key={index} className="animate-error-shake text-red-500 text-xs font-medium">
                                        • {err}
                                    </p>
                                ))}
                            </div>
                        )}
                        <PrimaryButton onClick={handleButton}
                                       className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200">Create account</PrimaryButton>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-1">
                        <span className="text-gray-pc text-sm">Already have an account?</span>
                        <span className="text-white text-sm">Log in</span>
                    </div>
                </div>
            )}

            {otpWindow && (
                <OTPScreen
                    otp={otp}
                    setOtp={setOtp}
                    onVerify={handleButton}
                    errors={errors}
                />
            )}
            <div id="recaptcha-container" className="fixed bottom-0 right-0 pointer-events-none opacity-0"></div>
        </div>
    );
}