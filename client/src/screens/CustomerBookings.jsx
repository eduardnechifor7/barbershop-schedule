import { useState, useEffect } from "react";
import {
    ArrowLeft, Calendar, Clock, User,
    Scissors, FileText
} from "lucide-react";
import { barberService } from "../services/barberService.js";
import { servicesService } from "../services/servicesService.js";
import { appointmentService } from "../services/appointmentService.js";
import { timeStringToMinutes, generateTimeSlots } from "../utils/timeUtils.js";
import Select, { components } from "react-select";
import {
    validateFields, required, minItems
} from "../utils/validation.js";

const CustomControl = ({ children, ...props }) => {
    const Icon = props.selectProps.icon;

    return (
        <components.Control {...props}>
            {Icon && (
                <Icon
                    size={18}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-pc pointer-events-none z-10"
                />
            )}
            {children}
        </components.Control>
    );
};

const selectStyles = {
    control: () =>
        "w-full bg-[#232222] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm text-[#F2EFE9] focus-within:border-[#DBB668] transition-all cursor-pointer flex items-center min-h-[46px]",
    menu: () =>
        "!bg-[#232222] border border-white/10 rounded-xl mt-2 overflow-hidden shadow-2xl z-50",
    option: ({ isFocused, isSelected }) =>
        `p-3 text-sm cursor-pointer transition-colors ${
            isSelected
                ? "bg-[#DBB668] text-[#1A1919] font-semibold"
                : isFocused
                    ? "bg-[#DBB668]/15 text-[#F2EFE9]"
                    : "text-[#F2EFE9]"
        }`,
    singleValue: () => "text-[#F2EFE9] text-sm",
    multiValue: () =>
        "bg-[#DBB668]/20 border border-[#DBB668]/40 rounded-lg px-2 py-0.5 mr-1.5 text-[#F2EFE9] flex items-center gap-1",
    multiValueLabel: () => "text-xs font-medium text-[#F2EFE9]",
    multiValueRemove: () =>
        "text-[#828282] hover:text-[#DBB668] transition-colors cursor-pointer",
    placeholder: () => "text-[#828282] text-sm",
    input: () => "text-[#F2EFE9] text-sm"
};

export function CustomerBookings({ onCancel, onSubmit }) {

    // Backend data
    const [servicesList, setServicesList] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [occupiedBookings, setOccupiedBookings] = useState([]);

    const [selectedService, setSelectedService] = useState([]);
    const [selectedBarber, setSelectedBarber] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const validationRules = {
        selectedService: [required, minItems],
        selectedBarber: [required],
        selectedDate: [required],
        selectedTime: [required]
    };

    useEffect(() => {
        const todayDate = new Date().toISOString().split('T')[0];
        setSelectedDate(todayDate);
        const loadData = async () => {
            try {
                const [barbersData, servicesData] = await Promise.all([
                    barberService.getAll?.() || [],
                    servicesService.getAll?.() || []
                ]);
                setBarbers(barbersData);
                setServicesList(servicesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        loadData();
    }, []);

    useEffect(() => {
        if (!selectedBarber || !selectedDate) return;

        const fetchOccupiedTimes = async () => {
            try {
                const occupiedSlots = await appointmentService.getOccupiedTimes(selectedBarber, selectedDate);
                setOccupiedBookings(occupiedSlots);
            } catch (error) {
                console.error("Error fetching occupied times:", error);
            }
        };
        fetchOccupiedTimes();
    }, [selectedDate, selectedBarber]);

    const allSlots = generateTimeSlots(9, 17, 30);
    const serviceDuration = servicesList.find(s => String(s.id )=== String(selectedService))?.duration || 30;
    const workEndMinutes = timeStringToMinutes("17:00");

    const occupiedIntervals = occupiedBookings.map(b => {
        const start = timeStringToMinutes(b.start_time);
        return {
            start: start,
            end: start + (b.minutes_duration || 30)
        };
    });

    const availableTimeSlots = allSlots.filter(slot => {
        const slotStart = timeStringToMinutes(slot);
        const slotEnd = slotStart + serviceDuration;

        if (slotEnd > workEndMinutes) return false;

        const hasOverlap = occupiedIntervals.some(booking => {
            return slotStart < booking.end && slotEnd > booking.start;
        });

        return !hasOverlap;
    });

    const handleSubmit = async () => {
        setSubmitting(true);
        const errorsForm = validateFields({ selectedService, selectedBarber, selectedDate, selectedTime }, validationRules);
        if (Object.keys(errorsForm).length > 0) {
            setErrors(errorsForm);
            setSubmitting(false);
            return;
        }

        try {
            await appointmentService.addAppointmentUser({
                barber_id: selectedBarber,
                service_ids: [selectedService],
                appointment_date: selectedDate,
                start_time: selectedTime,
                notes: notes
            });
            if (onSubmit) {
                onSubmit();
            }
        } catch (error) {
            console.error("Error submitting appointment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const barberOptions = barbers.map(b => ({ value: b.id, label: `${b.first_name} ${b.last_name}` }));

    return (
        <>
            {/* Header */}
            <div className="bg-[#1A1919] px-5 pt-3 pb-5">
                <div className="flex items-center gap-3 mb-1">
                    <button
                        onClick={onCancel}
                        className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                        <ArrowLeft size={17} className="text-[#F2EFE9]" />
                    </button>
                    <div>
                        <p className="text-gray-pc text-xs font-medium uppercase tracking-widest">Bookings</p>
                        <h1
                            className="text-[#F2EFE9] text-2xl font-bold leading-tight"
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            New Appointment
                        </h1>
                    </div>
                </div>
            </div>

            {/* Curved transition */}
            <div className="bg-[#1A1919]">
                <div className="bg-background rounded-t-3xl h-4" />
            </div>

            {/* Scrollable form */}
            <div
                className="bg-background px-5 pb-36 space-y-4 overflow-y-auto flex-1"
                style={{ scrollbarWidth: "none" }}
            >
                <div className="bg-[#2D2B2B] rounded-2xl p-4 border border-white/5 space-y-4">
                    {/* 1. Services */}
                    <div>
                        <label className="text-gray-pc text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            SERVICES
                        </label>
                        <div className="relative z-30">
                            <Select
                                isMulti
                                options={servicesList.map(s => ({ value: s.id, label: `${s.service_name} - ${s.price} RON` }))}
                                placeholder="Select services..."
                                onChange={(selectedOptions) => {
                                    const values = selectedOptions ? selectedOptions.map(o => o.value) : [];
                                    setSelectedService(values);
                                }}
                                value={
                                    servicesList
                                        .map(s => ({ value: s.id, label: `${s.service_name} - ${s.price} RON` }))
                                        .filter(o => (selectedService || []).includes(o.value))
                                }
                                icon={Scissors}
                                components={{ Control: CustomControl }}
                                unstyled
                                classNames={selectStyles}
                            />
                            {errors["selectedService"] && (
                                <p className="animate-error-shake text-red-400 text-xs font-medium p-1">
                                    • {errors["selectedService"]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 2. Barber */}
                    <div>
                        <label className="text-gray-pc text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            BARBER
                        </label>
                        <div className="relative z-20">
                            <Select
                                unstyled
                                options={barberOptions}
                                placeholder="Select a barber..."
                                classNames={selectStyles}
                                value={barberOptions.find((o) => o.value === selectedBarber) || null}
                                onChange={(selectedOption) => {
                                    setSelectedBarber(selectedOption ? selectedOption.value : "");
                                    setSelectedTime("");
                                }}
                                icon={User}
                                components={{ Control: CustomControl }}
                            />
                            {errors["selectedBarber"] && (
                                <p className="animate-error-shake text-red-400 text-xs font-medium p-1">
                                    • {errors["selectedBarber"]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3. Date */}
                    <div>
                        <label className="text-gray-pc text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            DATE
                        </label>
                        <div className="relative">
                            <Calendar size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold" />
                            <input
                                type="date"
                                value={selectedDate}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setSelectedTime("");
                                }}
                                className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-[#F2EFE9] focus:outline-none focus:border-brand-gold"
                            />
                            {errors["selectedDate"] && (
                                <p className="animate-error-shake text-red-400 text-xs font-medium p-1">
                                    • {errors["selectedDate"]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 4. Time */}
                    <div>
                        <label className="text-gray-pc text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            TIME
                        </label>
                        <div className="relative z-10">
                            <Clock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-gold" />
                            <Select
                                unstyled
                                placeholder={
                                    !selectedBarber
                                        ? "Select a barber first..."
                                        : availableTimeSlots.length === 0
                                            ? "No available slots..."
                                            : "Select time..."
                                }
                                classNames={selectStyles}
                                isDisabled={!selectedBarber || availableTimeSlots.length === 0}
                                value={selectedTime ? { value: selectedTime, label: selectedTime } : null}
                                onChange={(selectedOption) => {
                                    setSelectedTime(selectedOption ? selectedOption.value : "");
                                }}
                                options={availableTimeSlots.map((time) => ({ value: time, label: time }))}
                                icon={Clock}
                                components={{ Control: CustomControl }}
                            />
                            {errors["selectedTime"] && (
                                <p className="animate-error-shake text-red-400 text-xs font-medium p-1">
                                    • {errors["selectedTime"]}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 5. Notes */}
                    <div>
                        <label className="text-gray-pc text-[11px] font-bold uppercase tracking-wider block mb-1.5">
                            NOTES
                        </label>
                        <div className="relative">
                            <FileText size={18} className="absolute left-3.5 top-3.5 text-gray-pc" />
                            <textarea
                                rows={3}
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any special requests or notes for your barber..."
                                className="w-full bg-dark-bg border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-[#F2EFE9] placeholder-gray-pc/60 focus:outline-none focus:border-brand-gold resize-none"
                            />
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-1">
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex-1 rounded-xl py-4 text-sm font-semibold text-[#1A1919] bg-brand-gold hover:bg-[#c9a458] transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
                        >
                            {submitting ? "Booking..." : "Submit"}
                        </button>
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 rounded-xl py-4 text-sm font-semibold text-[#F2EFE9] border border-gray-pc/50 bg-transparent hover:bg-white/5 transition-all active:scale-[0.97]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}