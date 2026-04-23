import { AuthInput } from "../components/AuthInput.jsx";
import { PrimaryAuthButton } from "../components/PrimaryAuthButton.jsx";
import { AuthPhoneInput } from "../components/AuthPhoneInput.jsx";
import {OTPScreen} from "./OTPScreen.jsx";
import {useState} from "react";
import { auth} from "../src/firebase.js";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useEffect } from "react";

export function ContinueRegister( { phoneValue } ) {
    const [email, setEmail] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState(phoneValue);
    const [otp, setOtp] = useState("");
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [otpWindow, setOtpWindow] = useState(false);

    useEffect(() => {
        const container = document.getElementById('recaptcha-container');

        if (container && !window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => { }
            });
        }

        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
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
            const respone = await fetch("http://localhost:4000/api/users/sync", {
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

    const handleButton = async () => {
        // If OTP is not sent
        if (!isOtpSent) {
            if (!phone || !email || !firstName) {
                alert("Please complete all fields");
                return;
            }

            try {
                const appVerifier = window.recaptchaVerifier;
                const confirmationResult = await signInWithPhoneNumber(auth, phone, appVerifier);

                window.confirmationResult = confirmationResult;
                setIsOtpSent(true);
                alert("SMS sent! Please check your phone.");
                setOtpWindow(true);
            } catch (error) {
                setOtpWindow(false);
                console.error("Firebase error (SMS):", error);
                alert("Could not send SMS. Check if phone number is correct.");
            }
        }
        // Verify the code and send data to database
        else {
            try {
                const result = await window.confirmationResult.confirm(otp);
                const firebaseUser = result.user;

                await sendData(firebaseUser);
                alert("Account created successfully!");
            } catch (error) {
                console.error("OTP Error:", error);
                alert("Invalid code. Try again.");
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
                        <AuthPhoneInput
                            value={phone}
                            onChange={(val) => setPhone(val)} />
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
                        <AuthInput
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)} />
                        <PrimaryAuthButton onClick={handleButton}>Create account</PrimaryAuthButton>
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
                />
            )}
            <div id="recaptcha-container"></div>
        </div>
    );
}