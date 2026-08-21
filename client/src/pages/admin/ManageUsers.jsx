import { useState, useEffect } from "react";
import { FormModal } from "../../components/modals/FormModal.jsx";
import { ViewModal } from "../../components/modals/ViewModal.jsx";
import { userService } from "../../services/userService.js";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Eye,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Shield
} from "lucide-react";
import { EDIT_ADD_VIEW_USERS_LABELS } from "../../constants/labelsConfig.js";

export function ManageUsers() {
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [modalType, setModalType] = useState(null);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const selectedUser = users.find(u => u.id === selectedUserId);
    const navigate = useNavigate();

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
            setModalType(null);
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
                    Manage Users
                </h1>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-6">
                <button
                    disabled={!selectedUserId}
                    onClick={() => setModalType("VIEW")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedUserId
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-[#DBB668] border-[#DBB668]/30 cursor-pointer"
                            : "bg-[#2D2B2B]/40 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                    <Eye size={16} /> View
                </button>

                <button
                    disabled={!selectedUserId}
                    onClick={() => setModalType("EDIT")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedUserId
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-[#DBB668] border-[#DBB668]/30 cursor-pointer"
                            : "bg-[#2D2B2B]/40 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                    <Edit size={16} /> Edit
                </button>

                <button
                    disabled={!selectedUserId}
                    onClick={() => handleDeleteUser(selectedUserId)}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedUserId
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
                        className="animate-spin h-8 w-8 text-[#DBB668]"
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
                    {users.length === 0 ? (
                        <div className="bg-[#2D2B2B] p-8 rounded-2xl border border-white/5 text-center text-gray-400">
                            No users found.
                        </div>
                    ) : (
                        users.map((user) => {
                            const isSelected = selectedUserId === user.id;

                            return (
                                <div
                                    key={user.id}
                                    onClick={() => {
                                        setSelectedUserId(isSelected ? null : user.id);
                                    }}
                                    className={`relative flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
                                        isSelected
                                            ? "bg-[#2D2B2B] border-[#DBB668] shadow-lg shadow-black/40 translate-x-1"
                                            : "bg-[#2D2B2B]/70 border-white/5 hover:bg-[#2D2B2B] hover:border-white/10"
                                    }`}
                                >
                                    <div
                                        className={`absolute left-0 top-3 bottom-3 w-1 rounded-r-full transition-all ${
                                            isSelected ? "bg-[#DBB668]" : "bg-transparent"
                                        }`}
                                    />

                                    <div className="flex items-center justify-between w-full pl-2 gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 border border-white/10 shrink-0 flex items-center justify-center text-[#DBB668]">
                                                {user.photo_url ? (
                                                    <img
                                                        src={user.photo_url}
                                                        alt="Barber"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <User size={20} />
                                                )}
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-sm text-[#F2EFE9] truncate">
                                                        {user.first_name} {user.last_name}
                                                    </span>
                                                    {user.role === "Admin" && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                                                            <Shield size={10} />
                                                            Admin
                                                        </span>
                                                    )}
                                                </div>
                                                {user.email && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                                                        <Mail size={12} className="text-[#DBB668]/70" />
                                                        {user.email}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {user.phone_number && (
                                            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 shrink-0">
                                                <Phone size={13} className="text-[#DBB668]" />
                                                <span>{user.phone_number}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {modalType === "EDIT" && (
                        <FormModal
                            isOpen={true}
                            config={EDIT_ADD_VIEW_USERS_LABELS}
                            onClose={() => setModalType(null)}
                            onSubmit={handleEditUser}
                            isEdit={true}
                        />
                    )}
                    {modalType === "VIEW" && (
                        <ViewModal
                            isOpen={true}
                            config={EDIT_ADD_VIEW_USERS_LABELS}
                            onClose={() => setModalType(null)}
                            user={selectedUser}
                        />
                    )}
                </div>
            )}
        </div>
    );
}