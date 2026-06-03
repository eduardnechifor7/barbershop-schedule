import { useState, useEffect } from "react";
import { FormModal } from "../components/FormModal.jsx";
import { ViewModal } from "../components/ViewModal.jsx";
import { appointmentService } from "../services/appointmentService.js";
import { barberService } from "../services/barberService.js";
import { userService } from "../services/userService.js";

const inputLabelsForm = {
    "Appointment Date": "appointment_date",
    "Scheduled time": "start_time",
    "Client name": "user_id",
    "Barber name": "barber_id",
    "Appointment services": "service_ids",
    "Notes": "notes",
    "Status": "status"
};

export function ManageAppointments() {
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // 'ADD' 'VIEW' 'EDIT'
    const [appointments, setAppointments] = useState([]);
    const [users, setUsers] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const selectedAppointment = appointments.find(a => a.id === selectedAppId);

    const options = {
        "appointment_date": null,
        "start_time": null,
        "notes": null,
        "status": [
            { id: "scheduled", label: "Scheduled" },
            { id: "completed", label: "Finished" },
            { id: "cancelled", label: "Cancelled"}
        ],
        "barber_id": barbers.map(b => ({ id: b.id, label: `${b.last_name} ${b.first_name}`  })),
        "user_id": users.map(u => ({ id: u.id, label: `${u.last_name} ${u.first_name}`})),
        "service_ids": null
    }

    useEffect(() => {
        const fetchGetAllData = async () => {
            try {
                setIsLoading(true);
                const dataAppointments = await appointmentService.getAll();
                const dataBarbers = await barberService.getAll();
                const dataUsers = await userService.getAll();
                setAppointments(dataAppointments);
                setUsers(dataUsers);
                setBarbers(dataBarbers);

            } catch (error) {
                console.error("Error in listing appointments.", error.response?.data || error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGetAllData().catch(console.error);
    }), [refreshTrigger]

    const handleAddAppointment = async (formData) => {
        try {
            await appointmentService.addAppointment(formData);
            closeModal();
            setSelectedAppId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in adding appointment: ", error.message);
        }
    };

    const handleEditAppointment = async (formData) => {
        try {
            await appointmentService.edit(selectedAppId, formData);
            closeModal();
            setSelectedAppId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in editing appointment: ", error.message);
        }
    };

    const handleDeleteAppointment = async (id) => {
        try {
            await appointmentService.delete(id);
            setSelectedAppId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in deleting appointment: ", error.message);
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
            <div className="flex justify-between mb-6 gap-3">
                <button
                    onClick={() => openModal("ADD")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 bg-brand-gold text-black`}
                >
                    Add
                </button>
                <button
                    disabled={!selectedAppId}
                    onClick={() => openModal("VIEW")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedAppId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    View
                </button>
                <button
                    disabled={!selectedAppId}
                    onClick={() => openModal("EDIT")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedAppId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    Edit
                </button>
                <button
                    disabled={!selectedAppId}
                    onClick={() => handleDeleteAppointment(selectedAppId)}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedAppId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
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
                <div className = "flex flex-col justify-center items-center p-1 gap-3 mt-5">
                    {appointments.map((appointment) => {
                        const isSelected = selectedAppId === appointment.id;

                        return (
                            <div
                                key={appointment.id}
                                onClick={() => {
                                    setSelectedAppId(isSelected ? null : appointment.id);
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
                                        <span>{appointment.client_last_name + " " + appointment.client_first_name}</span>
                                        <span className="text-gray-400 font-light">/</span>
                                        <span>{appointment.appointment_date}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {isModalOpen && modalType === "ADD" && (
                        <FormModal isOpen={isModalOpen} config={inputLabelsForm} onClose={closeModal} onSubmit={handleAddAppointment} options={options} />
                    )}
                    {isModalOpen && modalType === "EDIT" && (
                        <FormModal isOpen={isModalOpen} config={inputLabelsForm} onClose={closeModal} onSubmit={handleEditAppointment} options={options} />
                    )}
                    {isModalOpen && modalType === "VIEW" && (
                        <ViewModal isOpen={isModalOpen} config={inputLabelsForm} onClose={closeModal} user={selectedAppointment} />
                    )}
                </div>
            )}
        </div>
    );
}