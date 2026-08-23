import { useEffect } from "react";
import { X } from "lucide-react";
import { TOAST_TYPES } from "../../constants/selectStyles";

export function Toast({ isOpen, message, type = "error", duration = 4000, onClose }) {
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const currentType = TOAST_TYPES[type] || TOAST_TYPES.error;
    const IconComponent = currentType.icon;

    return (
        <aside
            role="alert"
            aria-live="assertive"
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2.5rem)] max-w-sm animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto"
        >
            <div
                className={`relative overflow-hidden bg-[#1C1B1B] text-[#F2EFE9] rounded-2xl p-4 border ${currentType.glowBorder} shadow-2xl shadow-black/60 flex items-center justify-between gap-3`}
            >
                <span
                    className={`absolute left-0 top-0 bottom-0 w-1 ${currentType.indicator}`}
                />
                <div className="flex items-center gap-3 min-w-0 pl-1">
                    <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${currentType.badgeBg} ${currentType.iconColor}`}
                    >
                        <IconComponent size={18} />
                    </div>

                    <p className="text-sm font-medium text-[#F2EFE9] leading-snug line-clamp-2">
                        {message}
                    </p>
                </div>
                <button
                    onClick={onClose}
                    type="button"
                    aria-label="Close notification"
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition-colors shrink-0 cursor-pointer"
                >
                    <X size={15} />
                </button>
            </div>
        </aside>
    );
}