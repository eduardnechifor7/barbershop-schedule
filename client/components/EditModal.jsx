import { AuthInput } from "./AuthInput.jsx";
import { PrimaryButton } from "./PrimaryButton.jsx";
import { useState } from "react";

export function EditModal({ isOpen, onClose, config, onSubmit }) {
    const getInitialState = () =>
        Object.values(config).reduce((acc, backendKey) => ({ ...acc, [backendKey]: "" }), {});

    const [formData, setFormData] = useState(getInitialState);

    if (!isOpen) return null;

    const handleChange = (backendKey, value) => {
        setFormData(prev => ({ ...prev, [backendKey]: value }));
    }

    const handleSubmit = () => {
        onSubmit(formData);
        setFormData(getInitialState);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-start pt-40 z-50 bg-black/40 animate-fade-in">
            <div className="bg-brand-gold p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 transition-all transform animate-scale-up">
                <div className="flex flex-col justify-between items-center mb-4 text-black gap-5">
                    {Object.entries(config).map(([friendlyName, backendKey]) => {
                        return (
                            <AuthInput
                                key={backendKey}
                                placeholder={friendlyName}
                                value={formData[backendKey] || ""}
                                onChange={(e) => handleChange(backendKey, e.target.value)}
                            />
                        );
                    })}
                </div>
                <div className="flex flex-row justify-between items-center mb-4 text-black gap-5">
                    <PrimaryButton
                        onClick={handleSubmit}
                        className="w-auto bg-[#2d3748] hover:bg-[#242729] text-gray-200 focus:ring-gray-500 px-6 py-1 font-medium text-sm"
                    >
                        Submit
                    </PrimaryButton>
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