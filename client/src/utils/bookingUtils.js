import { timeStringToMinutes, generateTimeSlots } from "./timeUtils.js";


// Verify if a barber has all the required skills for a service
export const canBarberDoService = (barber, service) => {
    if (!barber || !service) return false;
    const barberSkillIds = (barber.skills_ids || []).map((sk) => sk.id);
    const serviceSkillIds = (service.skills_ids || []).map((sk) => sk.id);
    return serviceSkillIds.every((id) => barberSkillIds.includes(id));
};


// Filter barbers based on the selected services.
export const getFilteredBarbers = (barbers = [], services = [], selectedServiceIds = []) => {
    if (!selectedServiceIds.length) {
        return barbers;
    }

    const activeServices = selectedServiceIds
        .map((id) => services.find((s) => (s.id || s.service_id) === id))
        .filter(Boolean);


    return barbers.filter((barber) =>
        activeServices.every((service) => canBarberDoService(barber, service))
    );
};

// Filter services based on the selected barber.
export const getFilteredServices = (services = [], barbers = [], selectedBarberId = "") => {
    if (!selectedBarberId) return services;
    const currentBarber = barbers.find((b) => String(b.id) === String(selectedBarberId));
    return services.filter((service) => canBarberDoService(currentBarber, service));
};

export const getAvailableTimeSlots = ({
                                          services = [],
                                          occupiedBookings = [],
                                          selectedServiceIds = [],
                                          selectedDate = "",
                                          todayDate = "",
                                          startHour = 9,
                                          endHour = 17,
                                          slotInterval = 30
                                      }) => {
    const allSlots = generateTimeSlots(startHour, endHour, slotInterval);
    const workEndMinutes = timeStringToMinutes(`${endHour}:00`);

    const [year, month, dayNum] = selectedDate.split("-").map(Number);
    const dateObj = new Date(year, month - 1, dayNum);
    const day = dateObj.getDay();

    if (day === 0 || day === 6) {
        return []; // No weekend slots available
    }

    const serviceDuration =
        services
            .filter((s) => selectedServiceIds.map(Number).includes(Number(s.id || s.service_id)))
            .reduce((sum, s) => sum + Number(s.minutes_duration || 30), 0) || 30;

    const occupiedIntervals = occupiedBookings.map((b) => {
        const start = timeStringToMinutes(b.start_time);

        const duration = Number(b.total_duration ?? b.minutes_duration ?? 30);

        return {
            start,
            end: start + duration
        };
    });

    return allSlots.filter((slot) => {
        const slotStart = timeStringToMinutes(slot);
        const slotEnd = slotStart + serviceDuration;

        if (slotEnd > workEndMinutes) return false;

        if (selectedDate === todayDate) {
            const now = new Date();
            const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
            if (slotStart <= currentTimeMinutes) return false;
        }

        return !occupiedIntervals.some(
            (booking) => slotStart < booking.end && slotEnd > booking.start
        );
    });
};