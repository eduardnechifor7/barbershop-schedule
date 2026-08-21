import { CheckCircle2, XCircle, Clock } from "lucide-react";

export function StatusBadge({ status }) {
    switch (status?.toLowerCase()) {
        case "completed":
        case "finished":
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                    <CheckCircle2 size={12} />
                    Completed
                </span>
            );
        case "cancelled":
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-md">
                    <XCircle size={12} />
                    Cancelled
                </span>
            );
        default:
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                    <Clock size={12} />
                    Scheduled
                </span>
            );
    }
}