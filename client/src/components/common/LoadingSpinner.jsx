import { Scissors } from "lucide-react";

export function LoadingSpinner({ label = "Loading..." }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg">
            <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-2 border-white/5" />
                <div className="absolute w-12 h-12 rounded-full border-2 border-transparent border-t-brand-gold animate-spin" />
                <Scissors size={16} className="absolute text-brand-gold/70" />
            </div>
            {label && (
                <p className="mt-4 text-xs font-medium text-gray-pc tracking-wider uppercase animate-pulse">
                    {label}
                </p>
            )}
        </div>
    );
}