import { HelpCircle, X, Phone, Mail, Clock, MapPin, ExternalLink } from "lucide-react";

export function HelpSupportModal({
                                     isOpen,
                                     onClose,
                                     phone = "+40 700 000 000",
                                     email = "contact@salon.com",
                                     address = "Street ABC 10, Bucharest",
                                     schedule = "Monday – Friday: 09:00 AM – 05:00 PM"
                                 }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
            <div className="relative w-full max-w-lg bg-[#1C1B1B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
                <div className="h-0.5 bg-linear-to-r from-brand-gold via-[#c9a155] to-transparent shrink-0" />

                <div className="p-5 pb-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#262424] flex items-center justify-center text-brand-gold border border-white/5">
                            <HelpCircle size={18} />
                        </div>
                        <div>
                            <h2
                                className="text-xl font-bold text-[#F2EFE9] leading-tight"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Help & Support
                            </h2>
                            <p className="text-gray-400 text-xs">
                                Salon contact & opening hours
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

                <div
                    className="flex-1 overflow-y-auto p-5 space-y-3"
                    style={{ scrollbarWidth: "none" }}
                >
                    <div className="w-full p-4 rounded-2xl border border-white/5 bg-[#262424]/40 flex gap-3.5 items-start">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-brand-gold/10 text-brand-gold border border-brand-gold/20">
                            <Clock size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#F2EFE9] mb-0.5">
                                Opening Hours
                            </p>
                            <p className="text-gray-300 text-xs font-medium">
                                {schedule}
                            </p>
                            <p className="text-gray-500 text-[11px] mt-0.5">
                                Saturday – Sunday: Closed
                            </p>
                        </div>
                    </div>

                    <a
                        href={`tel:${phone.replace(/\s+/g, '')}`}
                        className="group w-full p-4 rounded-2xl border border-white/5 bg-[#262424]/40 hover:bg-[#262424] hover:border-brand-gold/30 transition-all duration-200 flex gap-3.5 items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/5 text-gray-400 group-hover:text-brand-gold group-hover:bg-brand-gold/10 transition-colors">
                                <Phone size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Phone</p>
                                <p className="text-sm font-semibold text-[#F2EFE9] group-hover:text-brand-gold transition-colors">
                                    {phone}
                                </p>
                            </div>
                        </div>
                        <ExternalLink size={14} className="text-gray-500 group-hover:text-brand-gold transition-colors shrink-0" />
                    </a>

                    <a
                        href={`mailto:${email}`}
                        className="group w-full p-4 rounded-2xl border border-white/5 bg-[#262424]/40 hover:bg-[#262424] hover:border-brand-gold/30 transition-all duration-200 flex gap-3.5 items-center justify-between cursor-pointer"
                    >
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/5 text-gray-400 group-hover:text-brand-gold group-hover:bg-brand-gold/10 transition-colors">
                                <Mail size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Email</p>
                                <p className="text-sm font-semibold text-[#F2EFE9] group-hover:text-brand-gold transition-colors truncate">
                                    {email}
                                </p>
                            </div>
                        </div>
                        <ExternalLink size={14} className="text-gray-500 group-hover:text-brand-gold transition-colors shrink-0" />
                    </a>

                    <div className="w-full p-4 rounded-2xl border border-white/5 bg-[#262424]/40 flex gap-3.5 items-start">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-white/5 text-gray-400">
                            <MapPin size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400">Location</p>
                            <p className="text-sm font-medium text-gray-300 mt-0.5">
                                {address}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-white/5 bg-[#1C1B1B] shrink-0">
                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-white/4 hover:bg-white/8 text-gray-300 hover:text-white text-xs font-medium border border-white/10 transition-all cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}