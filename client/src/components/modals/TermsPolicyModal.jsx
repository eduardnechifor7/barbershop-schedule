import { useState } from "react";
import { FileText, ShieldCheck, X, Lock, Scale, CheckCircle2 } from "lucide-react";

export function TermsPolicyModal({ isOpen, onClose, activeTabProp = "terms" }) {
    const [activeTab, setActiveTab] = useState(activeTabProp); // 'terms' | 'privacy'

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
            <div className="relative w-full max-w-xl bg-[#1C1B1B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                <div className="h-0.5 bg-linear-to-r from-brand-gold via-[#c9a155] to-transparent shrink-0" />

                <div className="p-5 pb-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#262424] flex items-center justify-center text-brand-gold border border-white/5">
                            {activeTab === "terms" ? <Scale size={18} /> : <ShieldCheck size={18} />}
                        </div>
                        <div>
                            <h2
                                className="text-xl font-bold text-[#F2EFE9] leading-tight"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Legal & Privacy
                            </h2>
                            <p className="text-gray-400 text-xs">
                                Our terms of service and data protection policies
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-[#262424] hover:bg-white/8 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-5 pt-4 shrink-0">
                    <div className="flex p-1 rounded-2xl bg-[#262424] border border-white/5">
                        <button
                            onClick={() => setActiveTab("terms")}
                            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                activeTab === "terms"
                                    ? "bg-brand-gold text-black shadow-md"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <FileText size={14} />
                            Terms of Service
                        </button>
                        <button
                            onClick={() => setActiveTab("privacy")}
                            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                                activeTab === "privacy"
                                    ? "bg-brand-gold text-black shadow-md"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            <Lock size={14} />
                            Privacy Policy
                        </button>
                    </div>
                </div>

                <div
                    className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-gray-300 leading-relaxed"
                    style={{ scrollbarWidth: "thin", scrollbarColor: "#DBB668/20 transparent" }}
                >
                    {activeTab === "terms" ? (
                        <>
                            <div className="p-3.5 rounded-2xl bg-[#262424]/40 border border-white/5 space-y-1">
                                <p className="font-semibold text-[#F2EFE9]">1. Appointments & Booking</p>
                                <p className="text-gray-400 text-[11px]">
                                    By booking an appointment through our platform, you agree to arrive on time. Cancellations should be made at least 24 hours in advance.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#262424]/40 border border-white/5 space-y-1">
                                <p className="font-semibold text-[#F2EFE9]">2. Late Arrivals & No-Shows</p>
                                <p className="text-gray-400 text-[11px]">
                                    Arriving more than 15 minutes late may result in rescheduling or a shortened appointment duration to respect other clients' schedules.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#262424]/40 border border-white/5 space-y-1">
                                <p className="font-semibold text-[#F2EFE9]">3. Pricing & Payments</p>
                                <p className="text-gray-400 text-[11px]">
                                    Prices for services are subject to change without prior notice. Payments can be made via cash, card, or integrated online payment options.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#262424]/40 border border-white/5 space-y-1">
                                <p className="font-semibold text-[#F2EFE9]">4. Account Responsibility</p>
                                <p className="text-gray-400 text-[11px]">
                                    You are responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your account.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-3.5 rounded-2xl bg-[#262424]/40 border border-white/5 space-y-1">
                                <p className="font-semibold text-[#F2EFE9]">1. Data We Collect</p>
                                <p className="text-gray-400 text-[11px]">
                                    We collect personal information such as your name, phone number, email address, and booking history to provide and improve our services.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#262424]/40 border border-white/5 space-y-1">
                                <p className="font-semibold text-[#F2EFE9]">2. How We Use Your Data</p>
                                <p className="text-gray-400 text-[11px]">
                                    Your data is used strictly for appointment confirmations, SMS/email reminders, customer support, and essential service updates.
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#262424]/40 border border-white/5 space-y-1">
                                <p className="font-semibold text-[#F2EFE9]">3. Third-Party Sharing</p>
                                <p className="text-gray-400 text-[11px]">
                                    We never sell or rent your personal information to third parties. Data is shared only with trusted service providers (e.g., authentication, SMS gateways).
                                </p>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#262424]/40 border border-white/5 space-y-1">
                                <p className="font-semibold text-[#F2EFE9]">4. Account Deletion & Rights</p>
                                <p className="text-gray-400 text-[11px]">
                                    You have the right to request access to or deletion of your personal data at any time through your account security settings.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-white/5 bg-[#1C1B1B] shrink-0 flex items-center justify-between gap-3">
                    <p className="text-[10px] text-gray-500 hidden sm:block">
                        Last updated: January 2026
                    </p>
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white/4 hover:bg-white/8 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                        <CheckCircle2 size={14} className="text-brand-gold" />
                        I Understand
                    </button>
                </div>

            </div>
        </div>
    );
}