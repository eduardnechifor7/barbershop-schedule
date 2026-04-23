import OTPInput from "react-otp-input";
import { PrimaryAuthButton } from "../components/PrimaryAuthButton.jsx";

export function OTPScreen ({ otp, setOtp, onVerify }) {
    
    return (
        <div className="min-h-screen flex flex-col justify-center items-center px-6">
            <div className="flex flex-col items-center">
                <span className="text-white text-base">Confirm it's you</span>
                <span className="text-white text-sm">Enter the verification code sent via SMS</span>
            </div>
            <OTPInput
                value={otp}
                onChange={setOtp}
                numInputs={6}
                renderSeparator={<span className="mx-1"></span>}
                renderInput={(props) => (
                    <input
                        {...props}
                        className="!w-12 !h-14 text-2xl text-center bg-white border border-gray-300 rounded-lg focus:ring-brand-gold focus:border-brand-gold text-black"
                    />
                )}
            />
            <PrimaryAuthButton onClick={onVerify}>
                Your chair is waiting
            </PrimaryAuthButton>
            <div className="flex flex-row items-center justify-baseline gap-1">
                <span className="text-gray-pc text-sm">Didn't get a code?</span>
                <span className="text-white text-sm">Resend</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-1">
                <span className="text-gray-pc text-sm">You don't have an account?</span>
                <span className="text-white text-sm">Sign up</span>
            </div>
        </div>
    );
}