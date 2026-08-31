

export function timeStringToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

export function generateTimeSlots(startHour = 9, endHour = 17, intervalMinutes = 30) {
    const slots = [];
    const start = new Date();
    start.setHours(startHour, 0, 0, 0);

    const end = new Date();
    end.setHours(endHour, 0, 0, 0);

    while (start < end) {
        const timeString = start.toLocaleTimeString("ro-RO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        });
        slots.push(timeString);
        start.setMinutes(start.getMinutes() + intervalMinutes);
    }
    return slots;
}