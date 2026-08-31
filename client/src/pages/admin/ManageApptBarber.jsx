import { useState, useEffect } from "react";
import { appointmentService } from "../../services/appointmentService.js";
import { userService } from "../../services/userService.js";
import { servicesService } from "../../services/servicesService.js";
import { barberService } from "../../services/barberService.js";
import { ViewModal } from "../../components/modals/ViewModal.jsx";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Calendar,
    Clock,
    User,
    Eye, Edit, Plus, Trash2
} from "lucide-react";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { VIEW_B_APPOINTMENT_LABELS } from "../../constants/labelsConfig.js";
import { ErrorScreen } from "../../components/common/ErrorScreen.jsx";
import { Toast } from "../../components/common/Toast.jsx";
import { AppointmentModal } from "../../components/modals/AppointmentModal.jsx";

export function ManageApptBarber() {
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [modalType, setModalType] = useState(null); // 'ADD' 'VIEW' 'EDIT'
    const [isLoading, setIsLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [data, setData] = useState({
        appointments: [],
        users: [],
        services: [],
        barbers: []
    });
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });

    const { appointments, users, services, barbers } = data;
    const navigate = useNavigate();
    const selectedAppointment = appointments.find((a) => a.appointment_id === selectedAppId);

    useEffect(() => {
        const controller = new AbortController();

        const loadSchedule = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const [appointmentsData, usersData, servicesData, myProfile] = await Promise.all([
                    appointmentService.getAsBarber(),
                    userService.getClients(),
                    servicesService.getAll(),
                    barberService.getMyProfile()
                ]);
                setData({
                    appointments: appointmentsData,
                    users: usersData,
                    services: servicesData,
                    barbers: [myProfile]
                });
            } catch (error) {
                setError("Failed to load your schedule. Please try again.");
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        void loadSchedule();

        return () => {
            controller.abort();
        }
    }, [refreshTrigger]);


    const handleEditAppointment = async (formData) => {
        try {
            await appointmentService.editAsBarber(selectedAppId, formData);
            setModalType(null);
            setSelectedAppId(null);
            setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to update the appointment. Please try again.",
                type: "error"
            });
        }
    };

    const handleDeleteAppointment = async (id) => {
        try {
            await appointmentService.delete(id);
            setSelectedAppId(null);
            setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to delete the appointment. Please try again.",
                type: "error"
            });
        }
    };

    const handleAddAppointment = async (formData) => {
        try {
            await appointmentService.createAsBarber(formData);
            setModalType(null);
            setSelectedAppId(null);
            setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to add the appointment. Please try again.",
                type: "error"
            });
        }
    };

    if (error) {
        return (
            <ErrorScreen
                errorText={error}
                onRetry={() => setRefreshTrigger((prev) => prev + 1)}
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
                    className="flex items-center gap-2 bg-[#2D2B2B] hover:bg-[#383535] text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/5 transition-all"
                >
                    <ArrowLeft size={16} /> Back to Dashboard
                </button>
                <h1
                    className="text-xl sm:text-2xl font-bold text-[#F2EFE9]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    My Daily Schedule
                </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                <button
                    onClick={() => setModalType("ADD")}
                    className="flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl bg-brand-gold hover:bg-[#c9a155] text-[#1A1919] transition active:scale-[0.98] text-sm shadow-sm"
                >
                    <Plus size={16} /> Add
                </button>

                <button
                    disabled={!selectedAppId}
                    onClick={() => setModalType("VIEW")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedAppId
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-brand-gold border-brand-gold/30"
                            : "bg-[#2D2B2B]/40 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                    <Eye size={16} /> View
                </button>

                <button
                    disabled={!selectedAppId}
                    onClick={() => setModalType("EDIT")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedAppId
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-brand-gold border-brand-gold/30"
                            : "bg-[#2D2B2B]/40 text-gray-600 border-white/5 cursor-not-allowed"
                    }`}
                >
                    <Edit size={16} /> Edit
                </button>

                <button
                    disabled={!selectedAppId}
                    onClick={() => handleDeleteAppointment(selectedAppId)}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedAppId
                            ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20"
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
                    {appointments.length === 0 ? (
                        <div className="bg-[#2D2B2B] p-8 rounded-2xl border border-white/5 text-center text-gray-400">
                            No appointments found.
                        </div>
                    ) : (
                        appointments.map((appointment) => {
                            const isSelected = selectedAppId === appointment.appointment_id;
                            const appointmentDate = new Date(appointment.appointment_date);

                            return (
                                <div
                                    key={appointment.appointment_id}
                                    onClick={() => {
                                        setSelectedAppId(isSelected ? null : appointment.appointment_id);
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

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pl-2 gap-2 sm:gap-4">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-brand-gold">
                                                <User size={16} />
                                            </div>
                                            <span className="font-semibold text-sm text-[#F2EFE9] truncate">
                                                {appointment.client_last_name} {" "} {appointment.client_first_name}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-gray-400">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                      <Calendar size={13} className="text-brand-gold" />
                                                    {appointmentDate.toLocaleDateString("en-US", {})}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={13} className="text-brand-gold" />
                                                    {appointment.start_time?.substring(0, 5)}
                                                </span>
                                            </div>

                                            <StatusBadge status={appointment.status} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {modalType === "ADD" && (
                        <AppointmentModal
                            isOpen={true}
                            onClose={() => setModalType(null)}
                            onSubmit={handleAddAppointment}
                            parsedData={{
                                barbers: barbers,
                                services: services,
                                users: users
                            }}
                        />
                    )}
                    {modalType === "EDIT" && (
                        <AppointmentModal
                            isOpen={true}
                            onClose={() => setModalType(null)}
                            onSubmit={handleEditAppointment}
                            parsedData={{
                                barbers: barbers,
                                services: services,
                                users: users
                            }}
                            isEdit={true}
                            initialData={selectedAppointment}
                        />
                    )}
                    {modalType === "VIEW" && (
                        <ViewModal
                            isOpen={true}
                            config={VIEW_B_APPOINTMENT_LABELS}
                            onClose={() => setModalType(null)}
                            user={selectedAppointment}
                        />
                    )}
                </div>
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