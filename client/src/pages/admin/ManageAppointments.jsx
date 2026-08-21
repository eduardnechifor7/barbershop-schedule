import { useState, useEffect, useMemo } from "react";
import { FormModal } from "../../components/modals/FormModal.jsx";
import { ViewModal } from "../../components/modals/ViewModal.jsx";
import { appointmentService } from "../../services/appointmentService.js";
import { barberService } from "../../services/barberService.js";
import { userService } from "../../services/userService.js";
import { servicesService } from "../../services/servicesService.js";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Plus,
    Eye,
    Edit,
    Trash2,
    Calendar,
    Clock,
    User,
    Filter
} from "lucide-react";
import { StatusBadge } from "../../components/common/StatusBadge.jsx";
import { EDIT_APPOINTMENT_LABELS, ADD_APPOINTMENT_LABELS, VIEW_APPOINTMENT_LABELS } from "../../constants/labelsConfig.js";

export function ManageAppointments() {
    const [selectedAppId, setSelectedAppId] = useState(null);
    const [modalType, setModalType] = useState(null); // 'ADD' 'VIEW' 'EDIT'
    const [data, setData] = useState({
        appointments: [],
        barbers: [],
        users: [],
        services: []
    })
    const [isLoading, setIsLoading] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedBarberFilter, setSelectedBarberFilter] = useState("all");

    const { appointments, barbers, users, services } = data;
    const selectedAppointment = appointments.find((a) => a.id === selectedAppId);
    const navigate = useNavigate();

    const options = useMemo(
        () => ({
            appointment_date: null,
            start_time: null,
            notes: null,
            status: [
                { value: "scheduled", label: "Scheduled" },
                { value: "completed", label: "Finished" },
                { value: "cancelled", label: "Cancelled" },
            ],
            barber_id: barbers.map((b) => ({
                value: b.id,
                label: `${b.last_name} ${b.first_name}`,
            })),
            user_id: users.map((u) => ({
                value: u.id,
                label: `${u.last_name} ${u.first_name}`,
            })),
            service_ids: services
                .filter((s) => s.is_active)
                .map((s) => ({ value: s.id, label: s.service_name })),
        }),
        [barbers, users, services]
    );

    const filteredAppointments = useMemo(() => {
        if (selectedBarberFilter === "all") return appointments;

        return appointments.filter((appointment) => String(appointment.barber_id) === String(selectedBarberFilter));
    }, [appointments, selectedBarberFilter]);

    useEffect(() => {
        const fetchGetAllData = async () => {
            try {
                setIsLoading(true);
                const [
                    dataAppointments,
                    dataBarbers,
                    dataUsers,
                    dataServices
                ] = await Promise.all([
                    appointmentService.getAll(),
                    barberService.getAll(),
                    userService.getAll(),
                    servicesService.getAll()
                ]);

                setData({
                    appointments: dataAppointments,
                    barbers: dataBarbers,
                    users: dataUsers,
                    services: dataServices
                });
            } catch (error) {
                console.error(
                    "Error in listing dashboard data.",
                    error.response?.data || error.message
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchGetAllData();
    }, [refreshTrigger]);

    const handleAddAppointment = async (formData) => {
        try {
            await appointmentService.addAppointment(formData);
            setModalType(null);
            setSelectedAppId(null);
            setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
            console.error("Error in adding appointment: ", error.message);
        }
    };

    const handleEditAppointment = async (formData) => {
        try {
            await appointmentService.edit(selectedAppId, formData);
            setModalType(null);
            setSelectedAppId(null);
            setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
            console.error("Error in editing appointment: ", error.message);
        }
    };

    const handleDeleteAppointment = async (id) => {
        try {
            await appointmentService.delete(id);
            setSelectedAppId(null);
            setRefreshTrigger((prev) => prev + 1);
        } catch (error) {
            console.error("Error in deleting appointment: ", error.message);
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
                    className="flex items-center gap-2 bg-[#2D2B2B] hover:bg-[#383535] text-gray-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-semibold border border-white/5 transition-all"
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <h1
                    className="text-xl sm:text-2xl font-bold text-[#F2EFE9]"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    Manage Appointments
                </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
                <button
                    onClick={() => setModalType("ADD")}
                    className="flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl bg-[#DBB668] hover:bg-[#c9a155] text-[#1A1919] transition active:scale-[0.98] text-sm shadow-sm"
                >
                    <Plus size={16} /> Add
                </button>

                <button
                    disabled={!selectedAppId}
                    onClick={() => setModalType("VIEW")}
                    className={`flex items-center justify-center gap-2 font-semibold px-4 py-2.5 rounded-xl text-sm border transition active:scale-[0.98] ${
                        selectedAppId
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-[#DBB668] border-[#DBB668]/30"
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
                            ? "bg-[#2D2B2B] hover:bg-[#383535] text-[#DBB668] border-[#DBB668]/30"
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

            <div className="flex items-center justify-between gap-3 mb-4 bg-[#2D2B2B]/50 p-2.5 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 pl-1">
                    <Filter size={14} className="text-[#DBB668]" />
                    <span>Filter by Barber:</span>
                </div>

                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    <button
                        onClick={() => setSelectedBarberFilter("all")}
                        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            selectedBarberFilter === "all"
                                ? "bg-[#DBB668] text-[#1A1919]"
                                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/5"
                        }`}
                    >
                        All Barbers
                    </button>

                    <select
                        value={selectedBarberFilter}
                        onChange={(e) => setSelectedBarberFilter(e.target.value)}
                        className="bg-[#1A1919] text-[#F2EFE9] text-xs font-semibold px-4 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#DBB668] cursor-pointer appearance-none"
                    >
                        <option value="all">Select Barber...</option>
                        {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                                {b.first_name} {b.last_name}
                            </option>
                        ))}
                    </select>
                </div>
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
                    {filteredAppointments.length === 0 ? (
                        <div className="bg-[#2D2B2B] p-8 rounded-2xl border border-white/5 text-center text-gray-400">
                            No appointments found.
                        </div>
                    ) : (
                        filteredAppointments.map((appointment) => {
                            const isSelected = selectedAppId === appointment.id;
                            const appointmentDate = new Date(appointment.appointment_date);

                            return (
                                <div
                                    key={appointment.id}
                                    onClick={() => {
                                        setSelectedAppId(isSelected ? null : appointment.id);
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

                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pl-2 gap-2 sm:gap-4">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-[#DBB668]">
                                                <User size={16} />
                                            </div>
                                            <span className="font-semibold text-sm text-[#F2EFE9] truncate">
                                                {appointment.client_last_name} {" "} {appointment.client_first_name}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-gray-400">
                                            <div className="flex items-center gap-3">
                                                <span className="flex items-center gap-1">
                                                      <Calendar size={13} className="text-[#DBB668]" />
                                                        {appointmentDate.toLocaleDateString("ro-RO")}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={13} className="text-[#DBB668]" />
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

                    {modalType && modalType === "ADD" && (
                        <FormModal
                            isOpen={true}
                            config={ADD_APPOINTMENT_LABELS}
                            onClose={() => setModalType(null)}
                            onSubmit={handleAddAppointment}
                            options={options}
                        />
                    )}
                    {modalType && modalType === "EDIT" && (
                        <FormModal
                            isOpen={true}
                            config={EDIT_APPOINTMENT_LABELS}
                            onClose={() => setModalType(null)}
                            onSubmit={handleEditAppointment}
                            options={options}
                            isEdit={true}
                        />
                    )}
                    {modalType && modalType === "VIEW" && (
                        <ViewModal
                            isOpen={true}
                            config={VIEW_APPOINTMENT_LABELS}
                            onClose={() => setModalType(null)}
                            user={selectedAppointment}
                        />
                    )}
                </div>
            )}
        </div>
    );
}