import {useEffect, useMemo, useState} from "react";
import {servicesService} from "../services/servicesService.js";
import {FormModal} from "../components/FormModal.jsx";
import {ViewModal} from "../components/ViewModal.jsx";

const inputLabels = {
    "Service Name": "service_name",
    "Price": "price",
    "Duration": "minutes_duration",
    "Status": "is_active"
};

export function ManageServices() {
    const [selectedServiceId, setSelectedServiceId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // 'ADD' 'VIEW' 'EDIT'
    const [services, setServices] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const selectedService = services.find(s => s.id === selectedServiceId);

    const options = useMemo( () => ({
        "service_name": null,
        "price": null,
        "minutes_duration": null,
        "is_active": [
            { id: true, label: 'Active', },
            { id: false, label: 'Inactive' }
        ]
    }), [services]);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                setIsLoading(true);
                const data = await servicesService.getAll();
                setServices(data);
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
    }

    const closeModal = () => {
        setModalType("");
        setIsModalOpen(false);
    }

    return (
        <div className="w-full max-w-auto mx-auto p-4 min-h-screen flex flex-col">
            <div className="flex justify-between mb-6 gap-3">
                <button
                    onClick={() => openModal("ADD")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 bg-brand-gold text-black`}
                >
                    Add
                </button>
                <button
                    disabled={!selectedServiceId}
                    onClick={() => openModal("VIEW")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedServiceId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    View
                </button>
                <button
                    disabled={!selectedServiceId}
                    onClick={() => openModal("EDIT")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedServiceId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    Edit
                </button>
            </div>
            {isLoading && (
                <div className = "flex justify-center items-center my-8">
                    <svg
                        className="animate-spin h-8 w-8 text-brand-gold"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12" cy="12" r="10"
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
                <div className = "flex flex-col justify-center items-center p-10 gap-3 mt-5 max-h-[calc(100vh-160px)] overflow-y-auto w-full operational-scroll">
                    {services.map((service) => {
                        const isSelected = selectedServiceId === service.id;

                        return (
                            <div
                                key={service.id}
                                onClick={() => {
                                    setSelectedServiceId(isSelected ? null : service.id);
                                }}
                                className={`flex items-center w-full justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                                    isSelected
                                        ? "bg-brand-gold text-black shadow-lg translate-x-1"
                                        : "bg-[#F1F3F5] text-black hover:bg-gray-200"
                                }`}
                            >
                                <div className = "flex items-center gap-3 w-full">
                                    <div className={`w-1 h-8 rounded-full transition-colors ${isSelected ? "bg-black" : "bg-transparent"}`} />
                                    <div className="flex flex-row items-center justify-start gap-3">
                                        <span>{service.service_name}</span>
                                        <span className="text-gray-400 font-light">/</span>
                                        <span>{service.is_active ? "Active" : "Inactive"}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {isModalOpen && modalType === "ADD" && (
                        <FormModal isOpen={isModalOpen} config={inputLabels} onClose={closeModal} onSubmit={handleAddService} options={options} />
                    )}
                    {isModalOpen && modalType === "EDIT" && (
                        <FormModal isOpen={isModalOpen} config={inputLabels} onClose={closeModal} onSubmit={handleEditService} options={options} />
                    )}
                    {isModalOpen && modalType === "VIEW" && (
                        <ViewModal isOpen={isModalOpen} config={inputLabels} onClose={closeModal} user={selectedService} />
                    )}
                </div>
            )}
        </div>
    );
}