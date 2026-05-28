import OTPInput from "react-otp-input";
import { PrimaryButton } from "../components/PrimaryButton.jsx";

export function OTPScreen ({ otp, setOtp, onVerify, errors = [], isLoading }) {
    
    return (
        <div className="min-h-dvh flex flex-col justify-between px-6 py-8">
            <div className="flex flex-col justify-center gap-6 flex-1">
                <div className="flex flex-col items-center">
                    <span className="text-white text-base font-medium">Confirm it's you</span>
                    <span className="text-white text-sm opacity-80">Enter the verification code sent via SMS</span>
                </div>

                <div className="flex justify-center">
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
                </div>

                {errors && errors.length > 0 && (
                    <div className="flex flex-col gap-1 mb-4">
                        {errors.map((err, index) => (
                            <p key={index} className="text-red-500 text-xs font-medium text-center">
                                • {err}
                            </p>
                        ))}
                    </div>
                )}

                <PrimaryButton onClick={onVerify}
                               isLoading={isLoading}
                               className="bg-brand-gold enabled:hover:bg-yellow-200 text-black focus:ring-yellow-200">
                    Your chair is waiting
                </PrimaryButton>

                <div className="flex flex-row items-center justify-center gap-1">
                    <span className="text-gray-pc text-sm">Didn't get a code?</span>
                    <span className="text-white text-sm font-semibold cursor-pointer">Resend</span>
                </div>
            </div>

            <div className="flex flex-row justify-center gap-1 mt-auto pb-4">
                <span className="text-gray-pc text-sm">You don't have an account?</span>
                <span className="text-white text-sm font-semibold cursor-pointer">Sign up</span>
            </div>
        </div>
    );
}