import { AuthPhoneInput } from "../components/AuthPhoneInput.jsx";
import { isValidPhoneNumber } from 'react-phone-number-input';
import { useState } from "react";
import { PrimaryButton } from "../components/PrimaryButton.jsx";
import { ContinueRegister } from "./ContinueRegister.jsx";
import { AdminDashboardMenu } from "./AdminDashboardMenu.jsx";
import appLogo from "../src/assets/cuthut_logo.png"
import OTPInput from "react-otp-input";
import {OTPScreen} from "./OTPScreen.jsx";
import { auth } from "../src/firebase.js";
import { useEffect } from "react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

export function WelcomeScreen() {
    const [phone, setPhone] = useState("");
    const [screen, setScreen] = useState('START'); // 'START', 'REGISTER', 'OTP', 'ADMIN'
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");

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
            setError("Phone number is required");
            return;
        } else if (!isValidPhoneNumber(phone)) {
            setError("The number format is invalid for the selected country");
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/api/users/check/${phone}`);
            const data = await response.json();
            if (data.exists && data.role === "Customer") {
                const appVerifier = window.recaptchaVerifier;
                const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
                window.confirmationResult = confirmationResult;
                setScreen('OTP');
            } else if (!data.exists) {
                setScreen('REGISTER');
            } else if (data.exists && data.role === "Admin") {
                const appVerifier = window.recaptchaVerifier;
                const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);
                window.confirmationResult = confirmationResult;
                setScreen('OTP');
            }
        } catch (error) {
            console.log(error);
            alert("Something went wrong.");
        }
    }

    const handleLoginVerify = async () => {
        try {
            await window.confirmationResult.confirm(otp);
            setScreen('ADMIN');
            alert("Welcome back to Cut Hut!");
            // Aici pui navigarea către Home
        } catch (error) {
            alert("Invalid code.");
        }
    };

    return (
        <div>
            {screen === 'START' && (
                <div key="start" className="animate-screen-in min-h-dvh flex flex-col justify-between py-12">
                    <div className="flex flex-col justify-evenly items-center px-6">
                        <div className="flex flex-col items-center gap-4">
                            <img src={appLogo} className="w-50 h-50 object-contain mb-4" alt="Cut Hut"/>
                            <div className="flex flex-col items-center justify-center">
                                <span className="text-white text-base font-bold">Welcome to Cut Hut</span>
                                <span className="text-white text-sm">Sign in or enter your details to get started</span>
                            </div>
                            <div className="flex flex-col justify-center items-center gap-4">
                                <AuthPhoneInput
                                    value={phone}
                                    onChange={(val) => setPhone(val)} />
                                {error && (
                                    <p className="animate-error-shake text-red-500 text-xs font-medium">
                                        • {error}
                                    </p>
                                )}
                                <PrimaryButton onClick={handleContinue}
                                               className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200">Continue</PrimaryButton>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-center text-gray-400 max-w-xs mx-auto leading-relaxed">
                        By clicking continue, you agree to our
                        <span className="text-white cursor-pointer font-medium"> Terms of Service </span>
                        and
                        <span className="text-white cursor-pointer font-medium"> Privacy Policy</span>
                    </p>
                </div>
            )}

            {screen === 'REGISTER' && (
                <div key="register" className="animate-screen-in">
                    <ContinueRegister phoneValue={phone} />
                </div>
            )}

            {screen === 'OTP' && (
                <div key="otp" className="animate-screen-in">
                    <OTPScreen
                        otp={otp}
                        setOtp={setOtp}
                        onVerify={handleLoginVerify}
                    />
                </div>
            )}

            {screen === 'ADMIN' && (
                <div key="admin" className="animate-screen-in">
                    <AdminDashboardMenu />
                </div>
            )}

            <div id="recaptcha-container" className="fixed bottom-0 right-0 pointer-events-none opacity-0"></div>
        </div>
    );
}