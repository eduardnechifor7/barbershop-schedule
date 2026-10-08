import { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { X } from "lucide-react";
import { appointmentService } from "../../services/appointmentService.js";
import { Toast } from "../common/Toast.jsx";
import {
    canBarberDoService,
    getAvailableTimeSlots,
    getFilteredBarbers,
    getFilteredServices
} from "../../utils/bookingUtils.js";
import { validateFields, required, minItems } from "../../utils/validation.js";
import { FORM_SELECT_STYLES } from "../../constants/selectStyles.js";

const VALIDATION_RULES = {
    service_ids: [required, minItems],
    user_id: [required],
    appointment_date: [required],
    start_time: [required]
};

export function AppointmentModal({
                                     isOpen,
                                     onClose,
                                     onSubmit,
                                     isEdit = false,
                                     initialData = null,
                                     isAdmin = false,
                                     parsedData = {}
                                 }) {
    const todayDate = useMemo(() => {
        return new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Europe/Bucharest',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    }, []);

    const [formData, setFormData] = useState({
        service_ids: [],
        barber_id: "",
        user_id: "",
        appointment_date: todayDate,
        start_time: "",
        notes: ""
    });

    const { barbers = [], services = [], users = [] } = parsedData;

    const [occupiedBookings, setOccupiedBookings] = useState([]);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ isOpen: false, message: "", type: "error" });

    useEffect(() => {
        if (!isOpen) return;
        if (isEdit && initialData) {
            setFormData({
                service_ids: (initialData.services || []).map((s) => s.service_id),
                barber_id: initialData.barber_id || "",
                user_id: initialData.user_id || "",
                appointment_date: initialData.appointment_date ? new Date(initialData.appointment_date).toLocaleDateString('en-CA') : todayDate,
                start_time: initialData.start_time ? initialData.start_time.slice(0, 5) : "",
                notes: initialData.notes || ""
            });
        } else {
            setFormData({
                service_ids: [],
                barber_id: barbers[0]?.id,
                user_id: "",
                appointment_date: todayDate,
                start_time: "",
                notes: ""
            });
        }
        setErrors({});
    }, [isOpen, isEdit, initialData, todayDate]);

    useEffect(() => {
        if (!isOpen || !formData.barber_id || !formData.appointment_date) {
            setOccupiedBookings([]);
            return;
        }

        const fetchOccupied = async () => {
            try {
                const slots = await appointmentService.getOccupiedTimes(
                    formData.barber_id,
                    formData.appointment_date
                );
                setOccupiedBookings(slots || []);
            } catch {
                setToast({
                    isOpen: true,
                    message: "Something went wrong. Please try again later.",
                    type: "error"
                });
            }
        };

        void fetchOccupied();
    }, [isOpen, formData.barber_id, formData.appointment_date]);

    const filteredBarbers = useMemo(
        () => getFilteredBarbers(barbers, services, formData.service_ids),
        [barbers, services, formData.service_ids]
    );

    const filteredServices = useMemo(
        () => getFilteredServices(services, barbers, formData.barber_id),
        [services, barbers, formData.barber_id]
    );

    const availableTimeSlots = useMemo(
        () =>
            getAvailableTimeSlots({
                services,
                occupiedBookings,
                selectedServiceIds: formData.service_ids,
                selectedDate: formData.appointment_date,
                todayDate
            }),
        [services, occupiedBookings, formData.service_ids, formData.appointment_date, todayDate]
    );

    const barberOptions = useMemo(
        () => filteredBarbers.map((b) => ({ value: b.id, label: `${b.first_name} ${b.last_name}` })),
        [filteredBarbers]
    );

    const serviceOptions = useMemo(
        () => filteredServices.map((s) => ({ value: s.id || s.service_id, label: `${s.service_name} - ${s.price} RON` })),
        [filteredServices]
    );

    const usersOptions = useMemo(
        () => users.map((u) => ({ value: u.id, label: `${u.first_name} ${u.last_name}` })),
        [users]
    );

    const handleServiceChange = (selected) => {
        const values = selected ? selected.map((s) => s.value) : [];
        setFormData((prev) => {
            let nextBarber = prev.barber_id;
            if (nextBarber) {
                const activeServices = values
                    .map((id) => services.find((s) => Number(s.service_id) === Number(id)))
                    .filter(Boolean);
                const currentBarberObj = barbers.find((b) => Number(b.id) === Number(nextBarber));
                if (!activeServices.every((s) => canBarberDoService(currentBarberObj, s))) {
                    nextBarber = "";
                }
            }
            return {
                ...prev,
                service_ids: values,
                barber_id: nextBarber,
                start_time: ""
            };
        });
    };

    const handleBarberChange = (selected) => {
        const barberId = selected ? selected.value : "";
        const currentBarber = barbers.find((b) => Number(b.id) === Number(barberId));

        setFormData((prev) => ({
            ...prev,
            barber_id: barberId,
            start_time: "",
            service_ids: prev.service_ids.filter((sId) => {
                const s = services.find((item) => Number(item.service_id) === Number(sId));
                return canBarberDoService(currentBarber, s);
            })
        }));
    };

    const handleSubmit = async () => {
        const activeRules = {
            ...VALIDATION_RULES,
            ...(isAdmin ? { barber_id: [required] } : {})
        }

        const validationErrors = validateFields(formData, activeRules);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            setSubmitting(true);
            await onSubmit(formData);
            onClose();
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Error saving appointment.",
                type: "error"
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in select-none">
            <div
                className="bg-[#1A1919] border border-white/10 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col text-[#F2EFE9] animate-scale-up"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                <div className="p-5 pb-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h2 className="text-xl font-bold text-[#F2EFE9]" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {isEdit ? "Edit Appointment" : "New Appointment"}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Client</label>
                        <Select
                            options={usersOptions}
                            placeholder="Select client..."
                            styles={FORM_SELECT_STYLES}
                            onChange={(opt) => setFormData((prev) => ({...prev, user_id: opt ? opt.value : ""}))}
                            value={usersOptions.find((o) => Number(o.value) === Number(formData.user_id)) || null}
                        />
                        {errors.user_id && <p className="text-red-400 text-xs mt-0.5">• {errors.user_id}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Services</label>
                        <Select
                            isMulti
                            options={serviceOptions}
                            placeholder="Select services..."
                            styles={FORM_SELECT_STYLES}
                            onChange={handleServiceChange}
                            value={serviceOptions.filter((o) =>
                                (formData.service_ids || []).some((id) => Number(id) === Number(o.value))
                            )}
                        />
                        {errors.service_ids && <p className="text-red-400 text-xs mt-0.5">• {errors.service_ids}</p>}
                    </div>

                    { isAdmin && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Barber</label>
                            <Select
                                options={barberOptions}
                                placeholder="Select barber..."
                                styles={FORM_SELECT_STYLES}
                                onChange={handleBarberChange}
                                value={barberOptions.find((o) => Number(o.value) === Number(formData.barber_id)) || null}
                            />
                            {errors.barber_id && <p className="text-red-400 text-xs mt-0.5">• {errors.barber_id}</p>}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</label>
                        <input
                            type="date"
                            min={todayDate}
                            value={formData.appointment_date}
                            onChange={(e) => setFormData((prev) => ({ ...prev, appointment_date: e.target.value, start_time: "" }))}
                            className="w-full bg-[#242323] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F2EFE9] focus:outline-none focus:border-brand-gold transition-colors"
                        />
                        {errors.appointment_date && <p className="text-red-400 text-xs mt-0.5">• {errors.appointment_date}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Time Slot</label>
                        <Select
                            options={availableTimeSlots.map((t) => ({ value: t, label: t }))}
                            placeholder={ availableTimeSlots.length === 0 ? "No available slots..." : ( !formData.barber_id ? "Select barber first..." : "Select time...")}
                            styles={FORM_SELECT_STYLES}
                            isDisabled={!formData.barber_id || availableTimeSlots.length === 0}
                            value={formData.start_time ? { value: formData.start_time, label: formData.start_time } : null}
                            onChange={(opt) => setFormData((prev) => ({ ...prev, start_time: opt ? opt.value : "" }))}
                        />
                        {errors.start_time && <p className="text-red-400 text-xs mt-0.5">• {errors.start_time}</p>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Optional notes..."
                            className="w-full bg-[#242323] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-[#F2EFE9] placeholder-gray-500 focus:outline-none focus:border-brand-gold resize-none"
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-[#1A1919] flex gap-3">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 bg-brand-gold hover:bg-[#c9a155] text-[#1A1919] font-bold py-2.5 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                    >
                        {submitting ? "Saving..." : isEdit ? "Save Changes" : "Create Appointment"}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 bg-white/5 hover:bg-white/10 text-[#F2EFE9] border border-white/10 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <Toast
                isOpen={toast.isOpen}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast((prev) => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}