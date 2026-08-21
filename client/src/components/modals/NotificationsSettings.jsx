import { useState, useEffect } from "react";
import { Sliders, X, Bell, Mail, MessageSquare } from "lucide-react";

export function NotificationsSettings({ isOpen, onClose, preferences, setUser }) {

    if (!isOpen) return null;

    const options = [
        {
            key: "in_app_notifications",
            title: "In-App Alerts",
            description: "Receive real-time booking updates inside the app.",
            icon: Bell,
            active: preferences.in_app_notifications,
        },
        {
            key: "email_notifications",
            title: "Email Reminders",
            description: "Get confirmation of appointments via email.",
            icon: Mail,
            active: preferences.email_notifications,
        },
        {
            key: "sms_notifications",
            title: "SMS Notifications",
            description: "Direct text messages with quick reminders before your appointment.",
            icon: MessageSquare,
            active: preferences.sms_notifications,
        },
    ];


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
            <div className="relative w-full max-w-lg bg-[#1C1B1B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                <div className="h-0.5 bg-gradient-to-r from-[#DBB668] via-[#c9a155] to-transparent shrink-0" />

                <div className="p-5 pb-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#262424] flex items-center justify-center text-[#DBB668] border border-white/5">
                            <Sliders size={18} />
                        </div>
                        <div>
                            <h2
                                className="text-xl font-bold text-[#F2EFE9] leading-tight"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Notification Settings
                            </h2>
                            <p className="text-gray-400 text-xs">
                                Choose how you want to receive updates
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-[#262424] hover:bg-white/[0.08] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-3">
                    {options.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.key}
                                onClick={() =>
                                    setUser &&
                                    setUser(item.key, !item.active)
                                }
                                className={`w-full p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                                    item.active
                                        ? "bg-[#262424] border-[#DBB668]/30 shadow-lg shadow-black/20"
                                        : "bg-[#262424]/40 border-white/5 opacity-70 hover:opacity-100 hover:border-white/10"
                                }`}
                            >
                                <div className="flex items-start gap-3.5 min-w-0">
                                    <div
                                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                            item.active
                                                ? "bg-[#DBB668]/10 text-[#DBB668] border border-[#DBB668]/20"
                                                : "bg-white/5 text-gray-400 border border-transparent"
                                        }`}
                                    >
                                        <Icon size={16} />
                                    </div>

                                    <div className="min-w-0">
                                        <p
                                            className={`text-sm font-semibold truncate ${
                                                item.active ? "text-[#F2EFE9]" : "text-gray-300"
                                            }`}
                                        >
                                            {item.title}
                                        </p>
                                        <p className="text-gray-400 text-xs leading-relaxed mt-0.5">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>

                                <div
                                    className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out border border-transparent ${
                                        item.active ? "bg-[#DBB668]" : "bg-white/10"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-5 w-5 transform rounded-full bg-[#121212] shadow-md transition duration-200 ease-in-out mt-[1px] ml-[1px] ${
                                            item.active ? "translate-x-5" : "translate-x-0"
                                        }`}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}