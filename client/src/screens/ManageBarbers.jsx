import {useEffect, useState} from "react";
import {FormModal} from "../components/FormModal.jsx";
import {ViewModal} from "../components/ViewModal.jsx";
import { barberService } from "../services/barberService.js";
import { useNavigate } from "react-router-dom";

const inputLabels = {
    "First Name": "first_name",
    "Last Name": "last_name",
    "Phone Number": "phone_number",
    "Photo URL": "photo_url",
    "Specialization": "specialization"
};

export function ManageBarbers() {
    const [selectedBarberId, setSelectedBarberId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // 'ADD' 'VIEW' 'EDIT'
    const [barbers, setBarbers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const selectedBarber = barbers.find(b => b.id === selectedBarberId);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBarbers = async () => {
            try {
                setIsLoading(true);
                const data = await barberService.getAll();
                setBarbers(data);
            } catch (error) {
                console.error("Error in listing barbers: ", error.response?.data || error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchBarbers().catch(console.error);
    }, [refreshTrigger]);

    const handleAddBarber = async (formData) => {
        try {
            await barberService.addBarber(formData);
            closeModal();
            setSelectedBarberId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in adding barber: ", error.message);
        }
    };

    const handleEditBarber = async (formData) => {
        try {
            await barberService.edit(selectedBarberId, formData);
            closeModal();
            setSelectedBarberId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in editing barber: ", error.message);
        }
    };

    const handleDeleteBarber = async (id) => {
        try {
            await barberService.delete(id);
            setSelectedBarberId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in deleting barber: ", error.message);
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
        <div className="w-full max-w-auto mx-auto p-4 min-h-screen flex flex-col">
            <div className="w-full max-w-4xl flex justify-start mb-4">
                <button
                    onClick={() => navigate("/admin")}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded text-sm font-semibold transition"
                >
                    ← Back
                </button>
            </div>
            <div className="flex justify-between mb-6 gap-3">
                <button
                    onClick={() => openModal("ADD")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 bg-brand-gold text-black`}
                >
                    Add
                </button>
                <button
                    disabled={!selectedBarberId}
                    onClick={() => openModal("VIEW")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedBarberId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    View
                </button>
                <button
                    disabled={!selectedBarberId}
                    onClick={() => openModal("EDIT")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedBarberId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    Edit
                </button>
                <button
                    disabled={!selectedBarberId}
                    onClick={() => handleDeleteBarber(selectedBarberId)}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedBarberId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    Delete
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
                    {barbers.map((barber) => {
                        const isSelected = selectedBarberId === barber.id;

                        return (
                            <div
                                key={barber.id}
                                onClick={() => {
                                    setSelectedBarberId(isSelected ? null : barber.id);
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
                                        <span className="flex justify-center items-center w-10 h-10 bg-blue-500 rounded-full overflow-hidden">
                                            <img src={barber.photo_url} alt="Profil" className="w-full h-full object-cover" />
                                        </span>
                                        <span>{barber.last_name + " " + barber.first_name}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {isModalOpen && modalType === "ADD" && (
                        <FormModal isOpen={isModalOpen} config={inputLabels} onClose={closeModal} onSubmit={handleAddBarber} />
                    )}
                    {isModalOpen && modalType === "EDIT" && (
                        <FormModal isOpen={isModalOpen} config={inputLabels} onClose={closeModal} onSubmit={handleEditBarber} isEdit={true} />
                    )}
                    {isModalOpen && modalType === "VIEW" && (
                        <ViewModal isOpen={isModalOpen} config={inputLabels} onClose={closeModal} user={selectedBarber} />
                    )}
                </div>
            )}
        </div>
    );
}