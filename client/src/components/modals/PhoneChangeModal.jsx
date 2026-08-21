import { useState } from "react";
import { Phone, X, AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { phone, required } from "../../utils/validation.js";

export function PhoneChangeModal({ isOpen, onClose, onSubmit, isLoading = false }) {
    const [phoneNumber, setPhoneNumber] = useState("");
    const [error, setError] = useState({});

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        const requiredError = required(phoneNumber);
        if (requiredError) {
            setError({ phoneNumber: requiredError });
            return;
        }

        const phoneError = phone(phoneNumber);
        if (phoneError) {
            setError({ phoneNumber: phoneError });
            return;
        }

        setError({});
        if (onSubmit) {
            onSubmit(phoneNumber.trim());
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
            <div className="relative w-full max-w-md bg-[#1C1B1B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="h-0.5 bg-gradient-to-r from-[#DBB668] via-[#c9a155] to-transparent shrink-0" />

                <div className="p-5 pb-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#262424] flex items-center justify-center text-[#DBB668] border border-white/5">
                            <Phone size={18} />
                        </div>
                        <div>
                            <h2
                                className="text-xl font-bold text-[#F2EFE9] leading-tight"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Change Phone
                            </h2>
                            <p className="text-gray-400 text-xs">
                                Enter your new phone number
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="w-9 h-9 rounded-xl bg-[#262424] hover:bg-white/[0.08] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5 disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            NEW PHONE NUMBER
                        </label>
                        <div className="relative mt-2">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="tel"
                                value={phoneNumber}
                                onChange={(e) => {
                                    setPhoneNumber(e.target.value);
                                    if (error.phoneNumber) setError({});
                                }}
                                placeholder="Enter new phone number..."
                                disabled={isLoading}
                                className="w-full bg-[#262424] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-[#F2EFE9] placeholder-gray-500 focus:outline-none focus:border-[#DBB668]/50 transition-colors disabled:opacity-50"
                            />
                        </div>
                        {error.phoneNumber && (
                            <p className="animate-error-shake text-red-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                                • {error.phoneNumber}
                            </p>
                        )}
                    </div>

                    <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-gray-400 text-xs leading-relaxed">
                        <AlertCircle size={15} className="text-[#DBB668] shrink-0 mt-0.5" />
                        <p>
                            We will send a 6-digit SMS verification code to verify this new number.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-2xl bg-[#DBB668] text-[#121212] font-bold text-sm hover:bg-[#c9a458] transition-all active:scale-[0.98] cursor-pointer shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 size={18} className="animate-spin text-[#121212]" />
                        ) : (
                            <>
                                <span>Send Verification Code</span>
                                <ArrowRight size={16} />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}