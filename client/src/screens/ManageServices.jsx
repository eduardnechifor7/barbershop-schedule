import { useEffect, useMemo, useState } from "react";
import { servicesService } from "../services/servicesService.js";
import { skillsService } from "../services/skillsService.js";
import { FormModal } from "../components/FormModal.jsx";
import { ViewModal } from "../components/ViewModal.jsx";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Eye,
    Edit,
    Scissors,
    Clock,
    CheckCircle2,
    XCircle
} from "lucide-react";

const inputLabels = {
    "Service Name": "service_name",
    "Price": "price",
    "Duration": "minutes_duration",
    "Description": "description",
    "Skills": "skills_ids",
    "Status": "is_active"
};

const viewLabels = {
    "Service Name": "service_name",
    "Price": "price",
    "Duration": "minutes_duration",
    "Description": "description",
    "Skills": "required_skills",
    "Status": "is_active"
};

export function ManageServices() {
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("");
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [skills, setSkills] = useState([]);

    const selectedService = services.find(s => s.service_id === selectedServiceId);
    const navigate = useNavigate();

    const options = useMemo(() => ({
        service_name: null,
        price: null,
        minutes_duration: null,
        skills_ids: skills.map(skill => ({ value: skill.id, label: skill.name })),
        is_active: [
            { value: true, label: 'Active' },
            { value: false, label: 'Inactive' }
        ]
    }), [skills]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setIsLoading(true);
                const [servicesData, skillsData] = await Promise.all([
                    servicesService.getAll(),
                    skillsService.getAll()
                ]);
                setServices(servicesData);
                setSkills(skillsData);
            } catch (error) {
                console.error("Error in listing services: ", error.response?.data || error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchServices().catch(console.error);
    }, [refreshTrigger]);

    const handleAddService = async (formData) => {
        try {
            await servicesService.addService(formData);
            closeModal();
            setSelectedServiceId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in adding service: ", error.message);
        }
    };

    const handleEditService = async (formData) => {
        try {
            await servicesService.edit(selectedServiceId, formData);
            closeModal();
            setSelectedServiceId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in editing service: ", error.message);
        }
    };

    const openModal = (type) => {
        setModalType(type);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setModalType("");
        setIsModalOpen(false);
    };

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
                    Manage Services
                </h1>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-6">
                <button
                    onClick={() => openModal("ADD")}
                    className="flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-[#c9a155] text-[#1A1919] transition active:scale-[0.98] text-sm shadow-sm cursor-pointer"
                >
                    <Plus size={16} /> Add
                </button>

                <button
                    disabled={!selectedServiceId}
                    onClick={() => openModal("VIEW")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedServiceId
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-brand-gold border-brand-gold/30 cursor-pointer"
                            : "bg-[#2D2B2B]/40 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                    <Eye size={16} /> View
                </button>

                <button
                    disabled={!selectedServiceId}
                    onClick={() => openModal("EDIT")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedServiceId
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-brand-gold border-brand-gold/30 cursor-pointer"
                            : "bg-[#2D2B2B]/40 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                    <Edit size={16} /> Edit
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
                    {services.length === 0 ? (
                        <div className="bg-[#2D2B2B] p-8 rounded-2xl border border-white/5 text-center text-gray-400">
                            No services found.
                        </div>
                    ) : (
                        services.map((service) => {
                            const isSelected = selectedServiceId === service.service_id;

                            return (
                                <div
                                    key={service.id}
                                    onClick={() => {
                                        setSelectedServiceId(isSelected ? null : service.service_id);
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
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-brand-gold">
                                                <Scissors size={20} />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="font-semibold text-sm text-[#F2EFE9] truncate">
                                                    {service.service_name}
                                                </span>
                                                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                                                    <span className="text-brand-gold font-semibold">
                                                        {service.price} RON
                                                    </span>
                                                    {service.minutes_duration && (
                                                        <span className="flex items-center gap-1">
                                                            <Clock size={11} className="text-gray-400" />
                                                            {service.minutes_duration} min
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {service.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
                                                    <CheckCircle2 size={12} />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-md">
                                                    <XCircle size={12} />
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {isModalOpen && modalType === "ADD" && (
                        <FormModal
                            isOpen={isModalOpen}
                            config={inputLabels}
                            onClose={closeModal}
                            onSubmit={handleAddService}
                            options={options}
                        />
                    )}
                    {isModalOpen && modalType === "EDIT" && (
                        <FormModal
                            isOpen={isModalOpen}
                            config={inputLabels}
                            onClose={closeModal}
                            onSubmit={handleEditService}
                            options={options}
                            isEdit={true}
                        />
                    )}
                    {isModalOpen && modalType === "VIEW" && (
                        <ViewModal
                            isOpen={isModalOpen}
                            config={viewLabels}
                            onClose={closeModal}
                            user={selectedService}
                        />
                    )}
                </div>
            )}
        </div>
    );
}