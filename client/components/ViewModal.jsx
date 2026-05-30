import { PrimaryButton } from "./PrimaryButton.jsx";

export function ViewModal({ isOpen, onClose, config, user }) {
    if (!isOpen) return null;


    return (
        <div className="fixed inset-0 flex flex-col items-center justify-start pt-40 z-50 bg-black/40 animate-fade-in">
            <div className="bg-brand-gold p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 transition-all transform animate-scale-up">
                <div className="flex flex-col justify-between mb-4 text-black gap-5">
                    {Object.entries(config).map(([friendlyName, backendKey]) => {
                        return (
                            <p className="flex flex-row text-m">
                                <span className="font-medium">{friendlyName + ": " + user[backendKey]}</span>
                            </p>
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