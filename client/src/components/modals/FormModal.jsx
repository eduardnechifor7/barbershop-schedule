import { useRef, useState } from "react";
import Select from 'react-select';
import {Pencil, X} from "lucide-react";
import {
    validateFields,
    required,
    email,
    phone,
    url,
    positiveNumber,
    positiveInteger,
    minItems,
    textOnly
} from "../../utils/validation.js";
import { FORM_SELECT_STYLES } from "../../constants/selectStyles.js";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../firebase.js";
import { Toast } from "../common/Toast.jsx";

export function FormModal({ isOpen, onClose, config, onSubmit, options = null, isEdit = false, initialData = null }) {
    const getInitialState = () => {
        if (isEdit && initialData) {
            return {
                ...initialData
            };
        }

        return Object.values(config).reduce((acc, backendKey) => {
            acc[backendKey] = (backendKey === "service_ids" || backendKey === "skills_ids") ? [] : "";
            return acc;
        }, {});
    }

    const initialAvatarUrlRef = useRef(isEdit && initialData ? initialData.photo_url : null);
    const fileInputRef = useRef(null);
    const [formData, setFormData] = useState(getInitialState);
    const [errors, setErrors] = useState({});
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });

    const validationRules = [
        {
            email: [required, email],
            service_name: [required, textOnly],
            phone_number: [required, phone],
            photo_url: [required, url],
            price: [required, positiveNumber],
            minutes_duration: [required, positiveInteger],
            service_ids: [minItems],
            skills_ids: [minItems]
        },
        {
            email: [email],
            service_name: [textOnly],
            phone_number: [phone],
            photo_url: [url],
            price: [positiveNumber],
            minutes_duration: [positiveInteger],
            service_ids: [minItems],
            skills_ids: [minItems]
        }
    ];

    if (!isOpen) return null;

    const deleteOldAvatar = async (url) => {
        if (!url || !url.includes("firebase")) return;
        try {
            const oldFileRef = ref(storage, url);
            await deleteObject(oldFileRef);
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to delete old avatar. Please try again.",
                type: "error"
            })
        }
    };

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

    const handleUpload = async (fileToUpload) => {
        if (!fileToUpload) return;

        const previousUploadedUrl = formData.photo_url;
        const fileName = `${Date.now()}_${fileToUpload.name}`;
        const storageRef = ref(storage, `avatars/${fileName}`);

        try {
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const downloadURL = await getDownloadURL(snapshot.ref);

            handleChange("photo_url", downloadURL);

            if (previousUploadedUrl && previousUploadedUrl !== initialAvatarUrlRef.current) {
                await deleteOldAvatar(previousUploadedUrl);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            void handleUpload(selectedFile);
        }

        e.target.value = "";
    };


    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

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
                        {isEdit ? "Edit Record" : "Add New Record"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-4 min-h-[35vh] max-h-[70vh] overflow-y-auto">
                    {Object.entries(config).map(([friendlyName, backendKey]) => {
                        let inputType = "text";
                        if (backendKey === "appointment_date") inputType = "date";
                        if (backendKey === "start_time") inputType = "time";

                        const currentOptions = options && options[backendKey];

                        if (backendKey === "photo_url") {
                            const fileName = fileInputRef.current?.files?.[0]?.name
                                || (formData.photo_url ? formData.photo_url.split("/").pop().split("?")[0] : "No file selected");

                            return (
                                <div key={backendKey} className="flex flex-col gap-1.5 w-full">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1">
                                        {friendlyName}
                                    </label>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                    <div className="flex items-center gap-2 bg-[#242323] border border-white/10 rounded-xl px-3 py-2">
                                        <button
                                            type="button"
                                            onClick={handleAvatarClick}
                                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#262424] hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer shrink-0"
                                        >
                                            <Pencil size={13} className="text-brand-gold" />
                                            <span>Choose File</span>
                                        </button>
                                        <span className="text-sm text-gray-400 truncate flex-1 pl-1">
                                            {fileName}
                                        </span>
                                    </div>

                                    {errors[backendKey] && (
                                        <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                                            • {errors[backendKey]}
                                        </p>
                                    )}
                                </div>
                            );
                        }

                        if (backendKey === "service_ids" || backendKey === "skills_ids") {
                            return (
                                <div key={backendKey} className="flex flex-col gap-1.5 w-full">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider pb-1">
                                        {friendlyName}
                                    </label>
                                    <Select
                                        isMulti
                                        name={backendKey}
                                        options={currentOptions}
                                        placeholder={`Select ${friendlyName.toLowerCase()}...`}
                                        styles={FORM_SELECT_STYLES}
                                        onChange={(selectedOptions) => {
                                            const values = selectedOptions ? selectedOptions.map(o => o.value) : [];
                                            handleChange(backendKey, values);
                                        }}
                                        value={(currentOptions || []).filter((o) =>
                                            (formData[backendKey] || []).some((item) => {
                                                const selectedId = typeof item === "object" && item !== null ? item.id : item;
                                                return Number(selectedId) === Number(o.value);
                                            })
                                        )}
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
                                        className="w-full bg-[#242323] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F2EFE9] placeholder-gray-500 focus:outline-none focus:border-brand-gold transition-colors"
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
                                    placeholder={`Select ${friendlyName.toLowerCase()}...`}
                                    styles={FORM_SELECT_STYLES}
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
                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="flex-1 bg-brand-gold hover:bg-[#c9a155] text-[#1A1919] font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                    >
                        Submit
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-[#F2EFE9] border border-white/10 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center"
                    >
                        Cancel
                    </button>
                </div>
            </div>
            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isOpen: false}))}
            />
        </div>
    );
}