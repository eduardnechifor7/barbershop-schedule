import { useState, useEffect } from "react";
import {
    ArrowLeft, Calendar, Clock, User,
    Scissors, FileText, Check
} from "lucide-react";
import { barberService } from "../services/barberService.js";
import { servicesService } from "../services/servicesService.js";
import { appointmentService } from "../services/appointmentService.js";
import { timeStringToMinutes, generateTimeSlots } from "../utils/timeUtils.js";
import Select, { components } from "react-select";
import {
    validateFields, required, minItems
} from "../utils/validation.js";
import { useLocation, useNavigate } from "react-router-dom";
import { BottomNav } from "../components/BottomNav.jsx";

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
        "!bg-[#232222] border border-white/10 rounded-xl mt-2 overflow-y-auto shadow-2xl z-50",
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

export function CustomerBookings() {
    const [servicesList, setServicesList] = useState([]);
    const [barbers, setBarbers] = useState([]);
    const [occupiedBookings, setOccupiedBookings] = useState([]);

    const [selectedDate, setSelectedDate] = useState("");
    const [selectedTime, setSelectedTime] = useState("");
    const [notes, setNotes] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);

    const todayDate = new Date().toISOString().split('T')[0];

    const navigate = useNavigate();
    const location = useLocation();

    const validationRules = {
        selectedService: [required, minItems],
        selectedBarber: [required],
        selectedDate: [required],
        selectedTime: [required]
    };

    const initialService = location.state?.preselectedServices || [];
    const initialBarber = location.state?.preselectedBarber || "";
    const [selectedService, setSelectedService] = useState(initialService);
    const [selectedBarber, setSelectedBarber] = useState(initialBarber);

    useEffect(() => {
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

    const filteredBarbers = (selectedService && selectedService.length > 0)
        ? barbers.filter(barber => {
            const activeServices = selectedService
                .map(selectedId => servicesList.find(s => (s.id || s.service_id) === selectedId))
                .filter(Boolean);
            const requiredSkillsIds = [...new Set(activeServices.flatMap(s => (s.required_skills || []).map(sk => sk.id)))];
            const barberSkillIds = (barber.skills || []).map(sk => sk.id);

            return requiredSkillsIds.every(id => barberSkillIds.includes(id));
        })
        : barbers;

    const filteredServices = selectedBarber
        ? servicesList.filter(service => {
            const currentBarber = barbers.find(b => String(b.id) === String(selectedBarber));
            if (!currentBarber) return true;

            const barberSkillIds = (currentBarber.skills || []).map(sk => sk.id);
            const serviceSkillIds = (service.required_skills || []).map(sk => sk.id);

            return serviceSkillIds.every(id => barberSkillIds.includes(id));
        })
        : servicesList;

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
    const serviceDuration = servicesList
        .filter(s => (selectedService || []).includes(s.id || s.service_id))
        .reduce((sum, s) => sum + (s.minutes_duration || 30), 0) || 30;
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

        if (selectedDate === todayDate) {
            const now = new Date();
            const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
            if (slotStart <= currentTimeMinutes) return false;
        }

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
                service_ids: selectedService,
                appointment_date: selectedDate,
                start_time: selectedTime,
                notes: notes
            });
            setSuccess(true);

            setTimeout(() => {
                navigate("/customer");
            }, 2000);

        } catch (error) {
            console.error("Error submitting appointment:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const barberOptions = filteredBarbers.map(b => ({ value: b.id, label: `${b.first_name} ${b.last_name}` }));

    const canBarberDoService = (barber, service) => {
        if (!barber || !service) return false;
        const barberSkillIds = (barber.skills || []).map(sk => sk.id);
        const serviceSkillIds = (service.required_skills || []).map(sk => sk.id);

        return serviceSkillIds.every(id => barberSkillIds.includes(id));
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-dark-bg p-4 text-center">
                <div className="relative flex items-center justify-center mb-4">
                    <div className="w-12 h-12 rounded-full border-2 border-[#DBB668]/20 bg-[#DBB668]/10 flex items-center justify-center" />
                    <Check size={20} className="absolute text-[#DBB668]" />
                </div>
                <p className="text-xs font-medium text-gray-pc tracking-wider uppercase">
                    Appointment Booked!
                </p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in flex flex-col h-screen h-[100dvh] bg-dark-bg overflow-hidden">
            {/* Header */}
            <div className="bg-[#1A1919] px-5 pt-5 pb-5 shrink-0">
                <div className="flex items-center gap-3 mb-1">
                    <button
                        onClick={() => navigate("/customer")}
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

            {/* Scrollable form */}
            <div
                className="bg-background px-5 py-10 pb-24 space-y-4 overflow-y-auto flex-1 min-h-0"
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
                                options={filteredServices.map(s => ({ value: s.id || s.service_id, label: `${s.service_name} - ${s.price} RON` }))}
                                placeholder="Select services..."
                                onChange={(selectedOptions) => {
                                    const selectedValues = selectedOptions ? selectedOptions.map(o => o.value) : [];
                                    setSelectedService(selectedValues);
                                    setSelectedTime("");

                                    if (selectedBarber) {
                                        const activeServices = selectedValues
                                            .map(selectedId => servicesList.find(s => (s.id || s.service_id) === selectedId))
                                            .filter(Boolean);
                                        const reqSkills = [...new Set(activeServices.flatMap(s => (s.required_skills || []).map(sk => sk.id)))];
                                        const currentBarberObj = barbers.find(b => String(b.id) === String(selectedBarber));

                                        const isStillEligible = currentBarberObj && reqSkills.every(id =>
                                            (currentBarberObj.skills || []).some(sk => sk.id === id)
                                        );

                                        if (!isStillEligible) {
                                            setSelectedBarber("");
                                        }
                                    }
                                }}
                                value={
                                    servicesList
                                        .map(s => ({ value: s.id || s.service_id, label: `${s.service_name} - ${s.price} RON` }))
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
                                    const barberId = selectedOption ? selectedOption.value : "";
                                    setSelectedBarber(barberId);
                                    setSelectedTime("");

                                    const currentBarber = barbers.find(b => String(b.id) === String(barberId));

                                    setSelectedService(prevServices =>
                                        prevServices.filter(serviceId => {
                                            const service = servicesList.find(s => (s.id || s.service_id) === serviceId);
                                            return canBarberDoService(currentBarber, service);
                                        })
                                    );
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
                            onClick={() => navigate("/customer")}
                            className="flex-1 rounded-xl py-4 text-sm font-semibold text-[#F2EFE9] border border-gray-pc/50 bg-transparent hover:bg-white/5 transition-all active:scale-[0.97]"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>

            <div className="shrink-0 z-40">
                <BottomNav />
            </div>
        </div>
    );
}