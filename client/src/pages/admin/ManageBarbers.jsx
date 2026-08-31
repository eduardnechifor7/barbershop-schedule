import { useEffect, useState, useMemo } from "react";
import { FormModal } from "../../components/modals/FormModal.jsx";
import { ViewModal } from "../../components/modals/ViewModal.jsx";
import { barberService } from "../../services/barberService.js";
import { skillsService } from "../../services/skillsService.js";
import { userService } from "../../services/userService.js";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Eye,
    Edit,
    Trash2,
    Scissors,
    Phone,
    User
} from "lucide-react";
import { EDIT_BARBERS_LABELS, ADD_BARBERS_LABELS, VIEW_BARBERS_LABELS } from "../../constants/labelsConfig.js";
import { ErrorScreen } from "../../components/common/ErrorScreen.jsx";
import { Toast } from "../../components/common/Toast.jsx";
import {ConfirmModal} from "../../components/modals/ConfirmModal.jsx";

export function ManageBarbers() {
    const [selectedBarberId, setSelectedBarberId] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [data, setData] = useState({
        barbers: [],
        skills: [],
        users: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });

    const { barbers, skills, users } = data;
    const selectedBarber = barbers.find(b => b.id === selectedBarberId);
    const navigate = useNavigate();

    const options = useMemo(() => ({
        user_id: users.filter(user => user.role !== "Barber").map(user => ({ value: user.id, label: `${user.first_name} ${user.last_name}` })),
        skills_ids: skills.map(skill => ({ value: skill.id, label: skill.name }))
    }), [skills, users]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchData = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const [barbersData, skillsData, userData] = await Promise.all([
                    barberService.getAll(),
                    skillsService.getAll(),
                    userService.getAll()
                ]);
                setData({
                    barbers: barbersData,
                    skills: skillsData,
                    users: userData
                });
            } catch (error) {
                setError("Failed to load barbers. Please try again.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };
        void fetchData();

        return () => {
            controller.abort();
        }
    }, [refreshTrigger]);

    const handleAddBarber = async (formData) => {
        try {
            await barberService.addBarber(formData);
            setModalType(null);
            setSelectedBarberId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to add barber. Please try again.",
                type: "error"
            });
        }
    };

    const handleEditBarber = async (formData) => {
        try {
            await barberService.edit(selectedBarberId, formData);
            setModalType(null);
            setSelectedBarberId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to edit barber. Please try again.",
                type: "error"
            });
        }
    };

    const handleDeleteBarber = async (id) => {
        try {
            setIsDeleting(true);
            await barberService.delete(id);
            setSelectedBarberId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to delete barber. Please try again.",
                type: "error"
            });
        } finally {
            setIsDeleting(false);
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

    return (
        <div
            className="w-full max-w-4xl mx-auto p-4 sm:p-6 min-h-screen flex flex-col bg-dark-bg text-[#F2EFE9]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate("/admin")}
                    className="flex items-center gap-2 bg-[#2D2B2B] hover:bg-[#383535] text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/5 transition-all cursor-pointer"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <h1
                    className="text-xl sm:text-2xl font-bold text-[#F2EFE9]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Manage Barbers
                </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                <button
                    onClick={() => setModalType("ADD")}
                    className="flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-[#c9a155] text-[#1A1919] transition active:scale-[0.98] text-sm shadow-sm cursor-pointer"
                >
                    <Plus size={16} /> Add
                </button>

                <button
                    disabled={!selectedBarberId}
                    onClick={() => setModalType("VIEW")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedBarberId
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-brand-gold border-brand-gold/30 cursor-pointer"
                            : "bg-[#2D2B2B]/40 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                    <Eye size={16} /> View
                </button>

                <button
                    disabled={!selectedBarberId}
                    onClick={() => setModalType("EDIT")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedBarberId
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-brand-gold border-brand-gold/30 cursor-pointer"
                            : "bg-[#2D2B2B]/40 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                    <Edit size={16} /> Edit
                </button>

                <button
                    disabled={!selectedBarberId}
                    onClick={() => setModalType("CONFIRM")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedBarberId
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20 cursor-pointer"
                            : "bg-[#2D2B2B]/40 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                    <Trash2 size={16} /> Delete
                </button>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center my-12">
                    <svg
                        className="animate-spin h-8 w-8 text-brand-gold"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                </div>
            )}

            {!isLoading && (
                <div className="flex flex-col gap-3 max-h-[calc(100vh-220px)] overflow-y-auto w-full pr-1">
                    {barbers.length === 0 ? (
                        <div className="bg-[#2D2B2B] p-8 rounded-2xl border border-white/5 text-center text-gray-400">
                            No barbers found.
                        </div>
                    ) : (
                        barbers.map((barber) => {
                            const isSelected = selectedBarberId === barber.id;

                            return (
                                <div
                                    key={barber.id}
                                    onClick={() => {
                                        setSelectedBarberId(isSelected ? null : barber.id);
                                    }}
                                    className={`relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                                        isSelected
                                            ? "bg-[#2D2B2B] border-brand-gold shadow-lg shadow-black/40 translate-x-1"
                                            : "bg-[#2D2B2B]/70 border-white/5 hover:bg-[#2D2B2B] hover:border-white/10"
                                    }`}
                                >
                                    <div
                                        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all ${
                                            isSelected ? "bg-brand-gold" : "bg-transparent"
                                        }`}
                                    />

                                    <div className="flex items-center justify-between w-full pl-2 gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-brand-gold">
                                                {barber.photo_url ? (
                                                    <img
                                                        src={barber.photo_url}
                                                        alt="Barber"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={20} />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold text-sm text-[#F2EFE9] truncate">
                                                    {barber.first_name} {barber.last_name}
                                                </span>
                                                {barber.specialization && (
                                                    <span className="text-xs text-brand-gold font-medium flex items-center gap-1 mt-0.5">
                                                        <Scissors size={11} />
                                                        {barber.specialization}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {barber.phone_number && (
                                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                <Phone size={13} className="text-brand-gold" />
                                                <span>{barber.phone_number}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {modalType === "ADD" && (
                        <FormModal
                            isOpen={true}
                            config={ADD_BARBERS_LABELS}
                            onClose={() => setModalType(null)}
                            onSubmit={handleAddBarber}
                            options={options}
                        />
                    )}
                    {modalType === "EDIT" && (
                        <FormModal
                            isOpen={true}
                            config={EDIT_BARBERS_LABELS}
                            onClose={() => setModalType(null)}
                            onSubmit={handleEditBarber}
                            options={options}
                            isEdit={true}
                            initialData={selectedBarber}
                        />
                    )}
                    {modalType === "VIEW" && (
                        <ViewModal
                            isOpen={true}
                            config={VIEW_BARBERS_LABELS}
                            onClose={() => setModalType(null)}
                            user={selectedBarber}
                        />
                    )}
                </div>
            )}

            {modalType === "CONFIRM" && (
                <ConfirmModal
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    onConfirm={() => {
                         void handleDeleteBarber(selectedBarberId);
                        setModalType(null);
                    }}
                    title="Delete Barber"
                    message={"Are you sure you want to delete this barber? All associated appointments will also be deleted."}
                    confirmText="Delete"
                    keepText="Keep Barber"
                    isLoading={isDeleting}
                />
            )}

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}