import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { userService } from "../../services/userService.js";
import { LoadingSpinner } from "../../components/common/LoadingSpinner.jsx";
import { validateFields, email, textOnly } from "../../utils/validation.js";
import { ArrowLeft, Pencil, Phone, Mail, Shield, User } from "lucide-react";
import { BottomNav } from "../../components/common/BottomNav.jsx";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "../../firebase.js";
import { ErrorScreen } from "../../components/common/ErrorScreen.jsx";
import { Toast } from "../../components/common/Toast.jsx";

export function PersonalInfoPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const passedUser = location.state?.user;

    const fileInputRef = useRef(null);
    const [errors, setErrors] = useState({});
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState(passedUser || {
        first_name: "",
        last_name: "",
        phone_number: "",
        email: "",
        role: "Client",
        photo_url: "",
        created_at: "",
    });
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });

    const initialAvatarUrlRef = useRef(null);

    const validationRules = {
        first_name: [textOnly],
        last_name: [textOnly],
        email: [email]
    }

    useEffect(() => {
        const fetchUserFallback = async () => {
            setLoading(true);
            try {
                setError(null);
                const userData = await userService.getProfile();
                setFormData(userData);
                initialAvatarUrlRef.current = userData?.photo_url || null;
            } catch (error) {
                setError("Failed to load your profile. Please try again.");
            } finally {
                setLoading(false);
            }
        }

        if (passedUser) {
            initialAvatarUrlRef.current = passedUser.photo_url || null;
            setLoading(false);
        } else {
            fetchUserFallback();
        }
    }, [passedUser, refreshTrigger]);

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

    const handleUpload = async (fileToUpload) => {
        if (!fileToUpload) return;

        const previousUploadedUrl = formData.photo_url;
        const fileName = `${Date.now()}_${fileToUpload.name}`;
        const storageRef = ref(storage, `avatars/${fileName}`);

        try {
            const snapshot = await uploadBytes(storageRef, fileToUpload);
            const downloadURL = await getDownloadURL(snapshot.ref);

            setFormData((prev) => ({ ...prev, photo_url: downloadURL }));

            if (previousUploadedUrl && previousUploadedUrl !== initialAvatarUrlRef.current) {
                await deleteOldAvatar(previousUploadedUrl);
            }
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Something went wrong. Please try again.",
                type: "error"
            });
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            handleUpload(selectedFile);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let nextErrors = {};
        try {
            nextErrors = validateFields(formData, validationRules) || {};
        } catch (err) {
            setToast({
                isOpen: true,
                message: "Something went wrong. Please try again.",
                type: "error"
            });
        }

        Object.keys(nextErrors).forEach((key) => {
            if (!nextErrors[key]) delete nextErrors[key];
        });

        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }

        try {
            await userService.edit(formData.id, formData)
            if (initialAvatarUrlRef.current && initialAvatarUrlRef.current !== formData.photo_url) {
                await deleteOldAvatar(initialAvatarUrlRef.current);
            }
            setErrors({});
            navigate(-1);
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to update personal information.",
                type: "error"
            });
        }
    };

    if (error) {
        return (
            <ErrorScreen
                errorText={error}
                onRetry={() => setRefreshTrigger(prev => prev + 1)}
            />
        );
    }

    if (loading) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <div className="flex flex-col h-screen h-[100dvh] bg-[#121212] text-[#F2EFE9] overflow-hidden select-none">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />

            <div className="bg-[#121212] px-6 pt-4 pb-3 shrink-0 border-b border-white/5 flex items-center gap-4">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 rounded-2xl bg-[#1C1B1B] border border-white/5 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                        ACCOUNT SETTINGS
                    </p>
                    <h1
                        className="text-3xl font-bold leading-tight mt-1 text-[#F2EFE9]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Personal Information
                    </h1>
                </div>
            </div>

            <div
                className="flex-1 min-h-0 overflow-y-auto px-5 py-6 pb-24 space-y-6"
                style={{ scrollbarWidth: "none" }}
            >
                <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-[#DBB668] text-[#121212] flex items-center justify-center font-bold text-2xl overflow-hidden border-2 border-white/10 shadow-lg">
                            {formData.photo_url ? (
                                <img
                                    src={formData.photo_url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span>{`${formData.first_name?.[0] || ""}${formData.last_name?.[0] || ""}`.toUpperCase()}</span>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={handleAvatarClick}
                            className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#262424] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-colors cursor-pointer shadow-md"
                        >
                            <Pencil size={14} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400 mt-2.5">
                        Tap to change profile picture
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-[#1C1B1B] rounded-3xl p-5 border border-white/5 space-y-4">
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                            PERSONAL DETAILS
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    FIRST NAME
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full bg-[#262424] border border-white/5 rounded-2xl px-4 py-3 mt-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#DBB668]/50 transition-colors"
                                />
                                {errors["first_name"] && (
                                    <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                                        • {errors["first_name"]}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    LAST NAME
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className="w-full bg-[#262424] border border-white/5 rounded-2xl px-4 py-3 mt-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#DBB668]/50 transition-colors"
                                />
                                {errors["last_name"] && (
                                    <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                                        • {errors["last_name"]}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                EMAIL ADDRESS
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#262424] border border-white/5 rounded-2xl pl-11 pr-4 py-3 mt-1.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#DBB668]/50 transition-colors"
                                />
                                {errors["email"] && (
                                    <p className="text-red-400 text-xs font-medium flex items-center gap-1 mt-0.5">
                                        • {errors["email"]}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                PHONE NUMBER
                            </label>
                            <div className="relative">
                                <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="tel"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    disabled
                                    className="w-full bg-[#262424]/50 border border-white/5 rounded-2xl pl-11 pr-11 py-3 mt-1.5 text-sm text-gray-400 cursor-not-allowed"
                                />
                                <Shield size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            </div>
                            <p className="text-[11px] text-gray-500 px-1">
                                Phone number managed via login credentials — read only.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#1C1B1B] rounded-3xl p-5 border border-white/5 space-y-3">
                        <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
                            ACCOUNT INFO
                        </p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#262424] flex items-center justify-center text-gray-300">
                                    <User size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Member Role</p>
                                    <p className="text-xs text-gray-400">
                                        Member since {formData.created_at
                                        ? new Date(formData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                        : "—"}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold tracking-wider text-[#DBB668] bg-[#DBB668]/15 px-2.5 py-1 rounded-md uppercase border border-[#DBB668]/30">
                                {formData.role}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-3 py-2">
                        <button
                            type="submit"
                            className="w-full py-4 rounded-2xl bg-[#DBB668] text-[#121212] font-bold text-sm hover:bg-[#c9a458] transition-all active:scale-[0.98] cursor-pointer shadow-md"
                        >
                            Save Changes
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="w-full py-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer"
                        >
                            Discard Changes
                        </button>
                    </div>
                </form>
            </div>
            <div className="shrink-0 z-40">
                <BottomNav />
            </div>

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}