import { AuthInput } from "./AuthInput.jsx";
import { PrimaryButton } from "./PrimaryButton.jsx";
import { useState } from "react";
import { Dropdown } from "./Dropdown.jsx";
import Select from 'react-select';

export function FormModal({ isOpen, onClose, config, onSubmit, options = null }) {

    const getInitialState = () =>
        Object.values(config).reduce((acc, backendKey) => {
            acc[backendKey] = backendKey === "service_ids" ? [] : "";
            return acc;
        }, {});

    const [formData, setFormData] = useState(getInitialState);

    if (!isOpen) return null;

    const handleChange = (backendKey, value) => {
        setFormData(prev => ({ ...prev, [backendKey]: value }));
    };

    const handleSubmit = () => {
        onSubmit(formData);
        setFormData(getInitialState);
        onClose();
    };

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-start pt-40 z-50 bg-black/40 animate-fade-in">
            <div className="bg-brand-gold p-6 rounded-lg shadow-lg max-w-sm w-full mx-4 transition-all transform animate-scale-up">
                <div className="flex flex-col justify-between items-center mb-4 text-black gap-5 w-full">
                    {Object.entries(config).map(([friendlyName, backendKey]) => {
                        let inputType = "text";
                        if (backendKey === "appointment_date") inputType = "date";
                        if (backendKey === "start_time") inputType = "time";

                        const currentOptions = options && options[backendKey];

                        if (backendKey === "service_ids") {
                            return (
                                <div key={backendKey} className="flex flex-col gap-2 w-full">
                                    <Select
                                        isMulti
                                        name={backendKey}
                                        options={currentOptions}
                                        placeholder="Select services..."
                                        className="block w-full text-sm text-black"
                                        onChange={(selectedOptions) => {
                                            const values = selectedOptions ? selectedOptions.map(o => o.value) : [];
                                            handleChange(backendKey, values);
                                        }}
                                        value={currentOptions ? currentOptions.filter(o => (formData[backendKey] || []).includes(o.value)) : []}
                                    />
                                </div>
                            );
                        }

                        return !options || !options[backendKey] ? (
                            <AuthInput
                                key={backendKey}
                                placeholder={friendlyName}
                                value={formData[backendKey] || ""}
                                type={inputType}
                                onChange={(e) => handleChange(backendKey, e.target.value)}
                            />
                        ) : (
                            <Dropdown
                                key={backendKey}
                                name={backendKey}
                                value={formData[backendKey] || ""}
                                placeholder={friendlyName}
                                onChange={(e) => handleChange(backendKey, e.target.value)}
                                options={currentOptions}
                            />
                        );
                    })}
                </div>
                <div className="flex flex-row justify-between items-center mb-4 text-black gap-5 w-full">
                    <PrimaryButton
                        onClick={handleSubmit}
                        className="w-full bg-[#2d3748] hover:bg-[#242729] text-gray-200 focus:ring-gray-500 px-6 py-2 font-medium text-sm rounded-md"
                    >
                        Submit
                    </PrimaryButton>
                    <PrimaryButton
                        onClick={onClose}
                        className="w-full bg-[#2d3748] hover:bg-[#242729] text-gray-200 focus:ring-gray-500 px-6 py-2 font-medium text-sm rounded-md"
                    >
                        Cancel
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}