import { useState, useEffect } from "react";
import { EditModal } from "../components/EditModal.jsx";
import { ViewModal } from "../components/ViewModal.jsx";
import { userService } from "../services/userService.js";

const inputLabels = {
    "First Name": "first_name",
    "Last Name": "last_name",
    "Phone Number": "phone_number",
    "Email": "email",
    "Role": "role"
};

export function ManageUsers() {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState(""); // 'VIEW' 'EDIT'
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const selectedUser = users.find(u => u.id === selectedUserId);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setIsLoading(true);
                const data = await userService.getAll();
                setUsers(data);
            } catch (error) {
                console.error("Error in listing users", error.response?.data || error.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers().catch(console.error);
    }, [refreshTrigger]);

    const handleEditUser = async (formData) => {
        try {
            await userService.edit(selectedUserId, formData);
            closeModal();
            setSelectedUserId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in editing user: ", error.message);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await userService.delete(id);
            setSelectedUserId(null);
            setRefreshTrigger(prev => prev + 1);
        } catch (error) {
            console.error("Error in deleteing user: ", error.message);
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
                    disabled={!selectedUserId}
                    onClick={() => openModal("VIEW")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedUserId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    View
                </button>
                <button
                    disabled={!selectedUserId}
                    onClick={() => openModal("EDIT")}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedUserId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                    Edit
                </button>
                <button
                    disabled={!selectedUserId}
                    onClick={() => handleDeleteUser(selectedUserId)}
                    className={`font-semibold px-4 py-2 rounded-lg flex-1 transition ${selectedUserId ? 'bg-brand-gold text-black' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
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
                    {users.map((user) => {
                        const isSelected = selectedUserId === user.id;

                        return (
                            <div
                                key={user.id}
                                onClick={() => {
                                    setSelectedUserId(isSelected ? null : user.id);
                                }}
                                className={`flex items-center w-full justify-between p-4 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${
                                    isSelected
                                        ? "bg-brand-gold text-black shadow-lg translate-x-1"
                                        : "bg-[#F1F3F5] text-black hover:bg-gray-200"
                                }`}
                            >
                                <div className = "flex items-center gap-3 w-full">
                                    <div className={`w-1 h-8 rounded-full transition-colors ${isSelected ? "bg-black" : "bg-transparent"}`} />
                                    <div className="flex flex-row items-center justify-start">
                                        <span>{user.last_name + " " + user.first_name}</span>
                                        <span className="text-gray-400 font-light">|</span>
                                        <span>{user.phone_number}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {isModalOpen && modalType === "EDIT" && (
                        <EditModal isOpen={isModalOpen} config={inputLabels} onClose={closeModal} onSubmit={handleEditUser}/>
                    )}
                    {isModalOpen && modalType === "VIEW" && (
                        <ViewModal isOpen={isModalOpen} config={inputLabels} onClose={closeModal} user={selectedUser} />
                    )}
                </div>
            )}
        </div>
    );
}