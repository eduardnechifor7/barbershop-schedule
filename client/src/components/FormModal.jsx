import { PrimaryButton } from "./PrimaryButton.jsx";
import { useState } from "react";
import Select from 'react-select';
import { X } from "lucide-react";
import {
    validateFields,
    required,
    email,
    phone,
    url,
    positiveNumber,
    positiveInteger,
    minItems, textOnly
} from "../utils/validation.js";

const customSelectStyles = {
    control: (base, state) => ({
        ...base,
        backgroundColor: '#242323',
        borderColor: state.isFocused ? '#DBB668' : 'rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        padding: '2px',
        boxShadow: 'none',
        '&:hover': {
            borderColor: 'rgba(219, 182, 104, 0.5)',
        },
    }),
    menu: (base) => ({
        ...base,
        backgroundColor: '#242323',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        zIndex: 60,
    }),
    valueContainer: (base) => ({
        ...base,
        backgroundColor: 'transparent',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? '#DBB668'
            : state.isFocused
                ? 'rgba(219, 182, 104, 0.15)'
                : 'transparent',
        color: state.isSelected ? '#1A1919' : '#F2EFE9',
        fontSize: '0.875rem',
        cursor: 'pointer',
        '&:active': {
            backgroundColor: '#DBB668',
            color: '#1A1919',
        },
    }),
    multiValue: (base) => ({
        ...base,
        backgroundColor: 'rgba(219, 182, 104, 0.15)',
        borderRadius: '0.5rem',
        border: '1px solid rgba(219, 182, 104, 0.3)',
    }),
    multiValueLabel: (base) => ({
        ...base,
        color: '#DBB668',
        fontWeight: '600',
        fontSize: '0.75rem',
    }),
    multiValueRemove: (base) => ({
        ...base,
        color: '#DBB668',
        ':hover': {
            backgroundColor: '#DBB668',
            color: '#1A1919',
        },
    }),
    placeholder: (base) => ({
        ...base,
        color: '#9CA3AF',
        fontSize: '0.875rem',
    }),
    singleValue: (base) => ({
        ...base,
        color: '#F2EFE9',
        backgroundColor: 'transparent',
        fontSize: '0.875rem',
    }),
    input: (base) => ({
        ...base,
        color: '#F2EFE9',
    }),
};

export function FormModal({ isOpen, onClose, config, onSubmit, options = null, isEdit = false }) {

    const getInitialState = () =>
        Object.values(config).reduce((acc, backendKey) => {
            acc[backendKey] = backendKey === "service_ids" ? [] : "";
            return acc;
        }, {});

    const [formData, setFormData] = useState(getInitialState);
    const [errors, setErrors] = useState({});

    const validationRules = [
        {
            email: [required, email],
            service_name: [required, textOnly],
            phone_number: [required, phone],
            photo_url: [required, url],
            price: [required, positiveNumber],
            minutes_duration: [required, positiveInteger],
            service_ids: [minItems]
        },
        {
            email: [email],
            service_name: [textOnly],
            phone_number: [phone],
            photo_url: [url],
            price: [positiveNumber],
            minutes_duration: [positiveInteger],
            service_ids: [minItems]
        }
    ];

    if (!isOpen) return null;

    const handleChange = (backendKey, value) => {
        setFormData(prev => ({ ...prev, [backendKey]: value }));
    };

    const handleSubmit = () => {
        const optionsIndex = isEdit ? 1 : 0;
        const activeRules = {};
        Object.values(config).forEach(backendKey => {
            if (validationRules[optionsIndex][backendKey]) {
                activeRules[backendKey] = validationRules[optionsIndex][backendKey];
            }
        });

        let nextErrors = {};
        try {
            nextErrors = validateFields(formData, activeRules) || {};
        } catch (e) {
            console.error("Error in validateFields", e);
        }

        Object.keys(nextErrors).forEach(key => {
            if (!nextErrors[key]) {
                delete nextErrors[key];
            }
        });

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        onSubmit(formData);
        setFormData(getInitialState());
        setErrors({});
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
            <div
                className="bg-[#1A1919] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-[#F2EFE9] animate-scale-up"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                <div className="p-5 pb-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2
                        className="text-xl font-bold text-[#F2EFE9]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        {isEdit ? "Edit Record" : "Add New Record"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    {Object.entries(config).map(([friendlyName, backendKey]) => {
                        let inputType = "text";
                        if (backendKey === "appointment_date") inputType = "date";
                        if (backendKey === "start_time") inputType = "time";

                        const currentOptions = options && options[backendKey];

                        if (backendKey === "service_ids") {
                            return (
                                <div key={backendKey} className="flex flex-col gap-1.5 w-full">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1">
                                        {friendlyName}
                                    </label>
                                    <Select
                                        isMulti
                                        name={backendKey}
                                        options={currentOptions}
                                        placeholder="Select services..."
                                        styles={customSelectStyles}
                                        onChange={(selectedOptions) => {
                                            const values = selectedOptions ? selectedOptions.map(o => o.value) : [];
                                            handleChange(backendKey, values);
                                        }}
                                        value={currentOptions ? currentOptions.filter(o => (formData[backendKey] || []).includes(o.value)) : []}
                                    />
                                    {errors[backendKey] && (
                                        <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                                            • {errors[backendKey]}
                                        </p>
                                    )}
                                </div>
                            );
                        }

                        return !options || !options[backendKey] ? (
                            <div key={backendKey} className="flex flex-col gap-1.5 w-full">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1">
                                    {friendlyName}
                                </label>
                                <div className="relative flex items-center">
                                    <input
                                        type={inputType}
                                        placeholder={friendlyName}
                                        value={formData[backendKey] || ""}
                                        onChange={(e) => handleChange(backendKey, e.target.value)}
                                        className="w-full bg-[#242323] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F2EFE9] placeholder-gray-500 focus:outline-none focus:border-[#DBB668] transition-colors"
                                    />
                                </div>

                                {errors[backendKey] && (
                                    <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                                        • {errors[backendKey]}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div key={backendKey} className="flex flex-col gap-1.5 w-full">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1">
                                    {friendlyName}
                                </label>
                                <Select
                                    name={backendKey}
                                    options={currentOptions}
                                    placeholder="Select barber..."
                                    styles={customSelectStyles}
                                    onChange={(selectedOption) => {
                                        handleChange(backendKey, selectedOption ? selectedOption.value : "");
                                    }}
                                    value={currentOptions ? currentOptions.find(o => o.value === formData[backendKey]) : null}
                                />
                                {errors[backendKey] && (
                                    <p className="text-red-400 text-xs font-medium flex align-center gap-1 mt-0.5">
                                        • {errors[backendKey]}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-white/10 bg-[#1A1919] flex gap-3">
                    <PrimaryButton
                        onClick={handleSubmit}
                        className="flex-1 bg-[#DBB668] hover:bg-[#c9a155] text-[#1A1919] font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98]"
                    >
                        Submit
                    </PrimaryButton>
                    <PrimaryButton
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-[#F2EFE9] border border-white/10 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98]"
                    >
                        Cancel
                    </PrimaryButton>
                </div>
            </div>
        </div>
    );
}