import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar, Clock, User, Scissors, FileText, Check } from "lucide-react";
import { barberService } from "../../services/barberService.js";
import { servicesService } from "../../services/servicesService.js";
import { appointmentService } from "../../services/appointmentService.js";
import { timeStringToMinutes, generateTimeSlots } from "../../utils/timeUtils.js";
import Select, { components } from "react-select";
import { validateFields, required, minItems } from "../../utils/validation.js";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "../../components/common/BottomNav.jsx";
import { BOOKING_SELECT_STYLES } from "../../constants/selectStyles.js";
import { Toast } from "../../components/common/Toast.jsx";

const canBarberDoService = (barber, service) => {
    if (!barber || !service) return false;
    const barberSkillIds = (barber.skills || []).map((sk) => sk.id);
    const serviceSkillIds = (service.required_skills || []).map((sk) => sk.id);
    return serviceSkillIds.every((id) => barberSkillIds.includes(id));
};

const CustomControl = ({ children, ...props }) => {
    const Icon = props.selectProps.icon;
    return (
        <components.Control {...props}>
            {Icon && (
                <Icon
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
                />
            )}
            {children}
        </components.Control>
    );
};

const VALIDATION_RULES = {
    selectedService: [required, minItems],
    selectedBarber: [required],
    selectedDate: [required],
    selectedTime: [required]
};

export function CustomerBookings() {
    const navigate = useNavigate();
    const location = useLocation();
    const todayDate = useMemo(() => new Date().toISOString().split("T")[0], []);

    const [data, setData] = useState({
        services: [],
        barbers: [],
        occupiedBookings: []
    });

    const [form, setForm] = useState({
        selectedService: location.state?.preselectedServices || [],
        selectedBarber: location.state?.preselectedBarber || "",
        selectedDate: todayDate,
        selectedTime: "",
        notes: ""
    });

    const [toast, setToast] = useState({
        isOpen: false,
        message: "",
        type: "error"
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [barbersData, servicesData] = await Promise.all([
                    barberService.getAll?.() || [],
                    servicesService.getAll?.() || []
                ]);
                setData((prev) => ({
                    ...prev,
                    barbers: barbersData,
                    services: servicesData
                }));
            } catch (error) {
                setToast({
                    isOpen: true,
                    message: "Failed to laod page. Please try again later.",
                    type: "error"
                });
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        if (!form.selectedBarber || !form.selectedDate) return;

        const fetchOccupiedTimes = async () => {
            try {
                const occupiedSlots = await appointmentService.getOccupiedTimes(
                    form.selectedBarber,
                    form.selectedDate
                );
                setData((prev) => ({ ...prev, occupiedBookings: occupiedSlots }));
            } catch (error) {
                setToast({
                    isOpen: true,
                    message: "Failed to laod page. Please try again later.",
                    type: "error"
                });
            }
        };
        fetchOccupiedTimes();
    }, [form.selectedDate, form.selectedBarber]);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const filteredBarbers = useMemo(() => {
        if (!form.selectedService?.length) return data.barbers;

        const activeServices = form.selectedService
            .map((id) => data.services.find((s) => (s.id || s.service_id) === id))
            .filter(Boolean);

        return data.barbers.filter((barber) =>
            activeServices.every((service) => canBarberDoService(barber, service))
        );
    }, [data.barbers, data.services, form.selectedService]);

    const filteredServices = useMemo(() => {
        if (!form.selectedBarber) return data.services;
        const currentBarber = data.barbers.find((b) => String(b.id) === String(form.selectedBarber));
        return data.services.filter((service) => canBarberDoService(currentBarber, service));
    }, [data.services, data.barbers, form.selectedBarber]);


    const availableTimeSlots = useMemo(() => {
        const allSlots = generateTimeSlots(9, 17, 30);
        const workEndMinutes = timeStringToMinutes("17:00");

        const serviceDuration =
            data.services
                .filter((s) => form.selectedService.includes(s.id || s.service_id))
                .reduce((sum, s) => sum + (s.minutes_duration || 30), 0) || 30;

        const occupiedIntervals = data.occupiedBookings.map((b) => {
            const start = timeStringToMinutes(b.start_time);
            return { start, end: start + (b.minutes_duration || 30) };
        });

        return allSlots.filter((slot) => {
            const slotStart = timeStringToMinutes(slot);
            const slotEnd = slotStart + serviceDuration;

            if (slotEnd > workEndMinutes) return false;

            if (form.selectedDate === todayDate) {
                const now = new Date();
                const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
                if (slotStart <= currentTimeMinutes) return false;
            }

            return !occupiedIntervals.some(
                (booking) => slotStart < booking.end && slotEnd > booking.start
            );
        });
    }, [data.services, data.occupiedBookings, form.selectedService, form.selectedDate, todayDate]);

    const barberOptions = useMemo(
        () => filteredBarbers.map((b) => ({ value: b.id, label: `${b.first_name} ${b.last_name}` })),
        [filteredBarbers]
    );

    const serviceOptions = useMemo(
        () => filteredServices.map((s) => ({ value: s.id || s.service_id, label: `${s.service_name} - ${s.price} RON` })),
        [filteredServices]
    );

    const handleServiceChange = (selectedOptions) => {
        const selectedValues = selectedOptions ? selectedOptions.map((o) => o.value) : [];
        setForm((prev) => {
            let nextBarber = prev.selectedBarber;
            if (nextBarber) {
                const activeServices = selectedValues
                    .map((id) => data.services.find((s) => (s.id || s.service_id) === id))
                    .filter(Boolean);
                const currentBarberObj = data.barbers.find((b) => String(b.id) === String(nextBarber));
                const isStillEligible = activeServices.every((s) => canBarberDoService(currentBarberObj, s));
                if (!isStillEligible) nextBarber = "";
            }
            return {
                ...prev,
                selectedService: selectedValues,
                selectedBarber: nextBarber,
                selectedTime: ""
            };
        });
    };

    const handleBarberChange = (selectedOption) => {
        const barberId = selectedOption ? selectedOption.value : "";
        const currentBarber = data.barbers.find((b) => String(b.id) === String(barberId));

        setForm((prev) => ({
            ...prev,
            selectedBarber: barberId,
            selectedTime: "",
            selectedService: prev.selectedService.filter((serviceId) => {
                const service = data.services.find((s) => (s.id || s.service_id) === serviceId);
                return canBarberDoService(currentBarber, service);
            })
        }));
    };

    const handleSubmit = async () => {
        const errorsForm = validateFields(form, VALIDATION_RULES);
        if (Object.keys(errorsForm).length > 0) {
            setErrors(errorsForm);
            return;
        }

        try {
            setSubmitting(true);
            setErrors({});
            await appointmentService.addAppointmentUser({
                barber_id: form.selectedBarber,
                service_ids: form.selectedService,
                appointment_date: form.selectedDate,
                start_time: form.selectedTime,
                notes: form.notes
            });
            setSuccess(true);
            setTimeout(() => navigate("/customer"), 2000);
        } catch (error) {
            setToast({
                isOpen: true,
                message: "Failed to submit appointment. Please try again later.",
                type: "error"
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] p-4 text-center">
                <div className="relative flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-[#DBB668]/20 bg-[#DBB668]/10 flex items-center justify-center" />
                    <Check size={20} className="absolute text-[#DBB668]" />
                </div>
                <p className="text-xs font-medium text-gray-400 tracking-wider uppercase">
                    Appointment Booked!
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in flex flex-col h-screen h-[100dvh] bg-[#121212] overflow-hidden">
            <div className="bg-[#121212] px-6 pt-6 pb-3 shrink-0 border-b border-white/5">
                <div className="flex items-center gap-3 mb-1">
                    <div>
                        <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Bookings</p>
                        <h1
                            className="text-3xl font-bold leading-tight mt-1 text-[#F2EFE9]"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            New Appointment
                        </h1>
                    </div>
                </div>
            </div>

            <div
                className="bg-[#121212] px-5 py-10 pb-24 space-y-4 overflow-y-auto flex-1 min-h-0"
                style={{ scrollbarWidth: "none" }}
            >
                <div className="bg-[#1C1B1B] rounded-2xl p-4 border border-white/5 space-y-4">
                    <div>
                        <label className="text-gray-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            SERVICES
                        </label>
                        <div className="relative z-30">
                            <Select
                                isMulti
                                menuPortalTarget={document.body}
                                options={serviceOptions}
                                placeholder="Select services..."
                                onChange={handleServiceChange}
                                value={serviceOptions.filter((o) => form.selectedService.includes(o.value))}
                                icon={Scissors}
                                components={{ Control: CustomControl }}
                                unstyled
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                classNames={BOOKING_SELECT_STYLES}
                            />
                            {errors["selectedService"] && (
                                <p className="animate-error-shake text-red-400 text-xs font-medium p-1">
                                    • {errors["selectedService"]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            BARBER
                        </label>
                        <div className="relative z-20">
                            <Select
                                unstyled
                                menuPortalTarget={document.body}
                                options={barberOptions}
                                placeholder="Select a barber..."
                                classNames={BOOKING_SELECT_STYLES}
                                value={barberOptions.find((o) => o.value === form.selectedBarber) || null}
                                onChange={handleBarberChange}
                                icon={User}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                components={{ Control: CustomControl }}
                            />
                            {errors["selectedBarber"] && (
                                <p className="animate-error-shake text-red-400 text-xs font-medium p-1">
                                    • {errors["selectedBarber"]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            DATE
                        </label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#DBB668]" />
                            <input
                                type="date"
                                value={form.selectedDate}
                                min={todayDate}
                                onChange={(e) => {
                                    updateField("selectedDate", e.target.value);
                                    updateField("selectedTime", "");
                                }}
                                className="w-full bg-[#262424] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-[#DBB668]"
                            />
                            {errors["selectedDate"] && (
                                <p className="animate-error-shake text-red-400 text-xs font-medium p-1">
                                    • {errors["selectedDate"]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            TIME
                        </label>
                        <div className="relative z-10">
                            <Select
                                unstyled
                                menuPortalTarget={document.body}
                                placeholder={
                                    !form.selectedBarber
                                        ? "Select a barber first..."
                                        : availableTimeSlots.length === 0
                                            ? "No available slots..."
                                            : "Select time..."
                                }
                                classNames={BOOKING_SELECT_STYLES}
                                isDisabled={!form.selectedBarber || availableTimeSlots.length === 0}
                                value={form.selectedTime ? { value: form.selectedTime, label: form.selectedTime } : null}
                                onChange={(opt) => updateField("selectedTime", opt ? opt.value : "")}
                                options={availableTimeSlots.map((time) => ({ value: time, label: time }))}
                                icon={Clock}
                                styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                components={{ Control: CustomControl }}
                            />
                            {errors["selectedTime"] && (
                                <p className="animate-error-shake text-red-400 text-xs font-medium p-1">
                                    • {errors["selectedTime"]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-gray-400 text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            NOTES
                        </label>
                        <div className="relative">
                            <FileText size={18} className="absolute left-3.5 top-3.5 text-gray-400" />
                            <textarea
                                rows={3}
                                value={form.notes}
                                onChange={(e) => updateField("notes", e.target.value)}
                                placeholder="Any special requests or notes for your barber..."
                                className="w-full bg-[#262424] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-[#F2EFE9] placeholder-gray-400/60 focus:outline-none focus:border-[#DBB668] resize-none"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 rounded-xl py-4 text-sm font-semibold text-[#121212] bg-[#DBB668] hover:bg-[#c9a458] transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? "Booking..." : "Submit"}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/customer")}
                            className="flex-1 rounded-xl py-4 text-sm font-semibold text-[#F2EFE9] border border-gray-400/50 bg-transparent hover:bg-white/5 transition-all active:scale-[0.97] cursor-pointer"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <div className="shrink-0 z-40">
                <BottomNav />
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