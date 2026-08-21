import {
    X,
    User,
    Calendar,
    Clock,
    Phone,
    Scissors,
    FileText,
    Tag,
    CheckCircle2,
    XCircle,
    AlertCircle,
    DollarSign,
    Info,
    Mail,
    Shield
} from "lucide-react";

const ICON_MAP = {
    "First Name": User,
    "Last Name": User,
    "Email": Mail,
    "Role": Shield,
    "Appointment Date": Calendar,
    "Start time": Clock,
    "Client Name": User,
    "Barber Name": Scissors,
    "Client Phone": Phone,
    "Phone Number": Phone,
    "Services": Tag,
    "Skills": Tag,
    "Notes": FileText,
    "Status": CheckCircle2,
    "Photo URL": User,
    "Service Name": Scissors,
    "Price": DollarSign,
    "Duration": Clock,
    "Description": Info
};

const formatValue = (user, backendKey, friendlyName) => {
    if (!user) return "-";

    if (Array.isArray(backendKey)) {
        return `${user[backendKey[0]] || ""} ${user[backendKey[1]] || ""}`.trim();
    }

    if (friendlyName === "Appointment Date" && user[backendKey]) {
        return new Date(user[backendKey]).toLocaleDateString("ro-RO");
    }

    if (friendlyName === "Price") {
        return `${user[backendKey]} RON`;
    }

    if (friendlyName === "Duration") {
        return `${user[backendKey]} minutes`;
    }

    if (friendlyName === "Start time") {
        return `${user[backendKey].slice(0, 5)}`;
    }

    return user[backendKey] || "-";
};

export function ViewModal({ isOpen, onClose, config, user }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
            <div
                className="bg-[#1A1919] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-[#F2EFE9] animate-scale-up"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                <div className="p-5 pb-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2
                        className="text-xl font-bold text-[#F2EFE9]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Details
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
                    {Object.entries(config).map(([friendlyName, backendKey]) => {
                        const isPhoto = friendlyName === "Photo URL";
                        const isStatus = friendlyName === "Status";
                        const isServicesSkills = friendlyName === "Services" || friendlyName === "Skills";
                        const displayValue = formatValue(user, backendKey, friendlyName);
                        const IconComponent = ICON_MAP[friendlyName];

                        if (isPhoto) {
                            return (
                                <div
                                    key={friendlyName}
                                    className="bg-[#242323] p-3 rounded-2xl border border-white/5 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <IconComponent size={16} className="text-[#DBB668]" />
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {friendlyName}
                                        </span>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl border border-white/10 overflow-hidden bg-white/5">
                                        {user[backendKey] ? (
                                            <img
                                                src={user[backendKey]}
                                                alt="Profil"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                <User size={20} />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        if (isStatus) {
                            const statusVal = String(user[backendKey]).toLowerCase();
                            const isCompleted = statusVal === "completed" || statusVal === "true" || statusVal === "active";
                            const isCancelled = statusVal === "cancelled" || statusVal === "inactive";

                            return (
                                <div
                                    key={friendlyName}
                                    className="bg-[#242323] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        {IconComponent && <IconComponent size={16} className="text-[#DBB668]" />}
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {friendlyName}
                                        </span>
                                    </div>
                                    <span
                                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border capitalize ${
                                            isCompleted
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                : isCancelled
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                        }`}
                                    >
                                        {isCompleted && <CheckCircle2 size={13} />}
                                        {isCancelled && <XCircle size={13} />}
                                        {!isCompleted && !isCancelled && <AlertCircle size={13} />}
                                        {user[backendKey] || "N/A"}
                                    </span>
                                </div>
                            );
                        }

                        if (isServicesSkills && Array.isArray(user[backendKey])) {
                            return (
                                <div
                                    key={friendlyName}
                                    className="bg-[#242323] p-3.5 rounded-2xl border border-white/5 space-y-2"
                                >
                                    <div className="flex items-center gap-2">
                                        <IconComponent size={16} className="text-[#DBB668]" />
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                            {friendlyName}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {user[backendKey]?.length > 0 ? (
                                            user[backendKey].map((s, idx) => (
                                                <span
                                                    key={idx}
                                                    className="bg-white/5 border border-white/10 text-xs px-2.5 py-1 rounded-lg text-[#DBB668] font-medium"
                                                >
                                                    {friendlyName === "Services"
                                                        ? `${s.service_name} • ${s.price_at_booking} RON`
                                                        : s.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-gray-500">-</span>
                                        )}
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <div
                                key={friendlyName}
                                className="bg-[#242323] p-3.5 rounded-2xl border border-white/5 flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-2 shrink-0">
                                    {IconComponent && <IconComponent size={16} className="text-[#DBB668]" />}
                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        {friendlyName}:
                                    </span>
                                </div>
                                <span className="text-sm font-semibold text-[#F2EFE9] truncate text-right">
                                    {displayValue}
                                </span>
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#1A1919] flex justify-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full bg-white/5 hover:bg-white/10 text-[#F2EFE9] border border-white/10 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}