import { AlertTriangle } from "lucide-react";

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", keepText = "Keep it", isLoading }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
            <div className="bg-dark-bg border border-white/10 rounded-2xl p-5 max-w-xs w-full shadow-2xl flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <AlertTriangle size={22} className="text-red-400" />
                </div>

                <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#F2EFE9]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {title}
                    </h3>
                    <p className="text-gray-pc text-xs leading-relaxed">{message}</p>
                </div>

                <div className="flex gap-2 w-full pt-1">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-[#F2EFE9] border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer"
                    >
                        {keepText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white bg-red-400 hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}