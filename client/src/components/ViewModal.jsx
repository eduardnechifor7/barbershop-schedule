import { PrimaryButton } from "./PrimaryButton.jsx";

const formatValue = (user, backendKey, friendlyName) => {
    if (!user) return "";

    if (Array.isArray(backendKey)) {
        return `${user[backendKey[0]] || ""} ${user[backendKey[1]] || ""}`.trim();
    }

    if (friendlyName === "Appointment Date" && user[backendKey]) {
        return new Date(user[backendKey]).toLocaleDateString("ro-RO");
    }

    if (friendlyName === "Services" && Array.isArray(user[backendKey])) {
        return user[backendKey]
            .map(s => `${s.service_name} / ${s.price_at_booking} RON`)
            .join(" | ");
    }

    if (friendlyName === "Price") {
        return `${user[backendKey]} RON`;
    }

    if (friendlyName === "Duration") {
        return `${user[backendKey]} minutes`;
    }

    if (friendlyName === "Status") {
        const isActive = user[backendKey] === true || user[backendKey] === "true";

        return isActive ? "Active" : "Inactive";
    }

    return user[backendKey] || "-";
};

export function ViewModal({ isOpen, onClose, config, user }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-start pt-40 z-50 bg-black/40 animate-fade-in">
            <div className="bg-brand-gold p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 transition-all transform animate-scale-up">

                <div className="flex flex-col justify-between mb-4 text-black gap-5">
                    {Object.entries(config).map(([friendlyName, backendKey]) => {
                        const isPhoto = friendlyName === "Photo URL";
                        const displayValue = formatValue(user, backendKey, friendlyName);

                        return (
                            <div key={friendlyName} className="flex flex-row items-center gap-3 text-m">
                                <span className="font-medium">{friendlyName}: </span>

                                {isPhoto ? (
                                    <div className="w-10 h-10 bg-blue-500 rounded-full overflow-hidden">
                                        <img src={user[backendKey]} alt="Profil" className="w-full h-full object-cover"/>
                                    </div>
                                ) : (
                                    <span className="whitespace-pre-line">{displayValue}</span>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex flex-row justify-center items-center mb-4 text-black gap-5">
                    <PrimaryButton
                        onClick={onClose}
                        className="w-auto bg-[#2d3748] hover:bg-[#242729] text-gray-200 focus:ring-gray-500 px-6 py-1 font-medium text-sm"
                    >
                        Cancel
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}