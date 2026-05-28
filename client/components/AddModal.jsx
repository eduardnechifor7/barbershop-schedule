import { AuthInput } from "./AuthInput.jsx";
import { PrimaryButton } from "./PrimaryButton.jsx";
import { useState } from "react";

export function AddModal({ isOpen, onClose, labels, onSubmit }) {
    const [formData, setFormData] = useState(
        labels.reduce((acc, label) => ({ ...acc, [label]: "" }), {})
    );

    if (!isOpen) return null;

    const handleChange = (label, value) => {
        setFormData(prev => ({ ...prev, [label]: value }));
    }

    const handleSubmit = () => {
        onSubmit(formData);
        setFormData(labels.reduce((acc, label) => ({ ...acc, [label]: "" }), {}));
        onClose();
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-start pt-40 z-50 bg-black/40 animate-fade-in">
            <div className="bg-brand-gold p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 transition-all transform animate-scale-up">
                <div className="flex flex-col justify-between items-center mb-4 text-black gap-5">
                    {labels.map((label) => {
                        return (
                            <AuthInput
                                key={label}
                                placeholder={label}
                                onChange={(e) => handleChange(label, e.target.value)}
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