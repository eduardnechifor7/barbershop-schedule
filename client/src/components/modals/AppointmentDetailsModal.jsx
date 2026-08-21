import React from "react";
import {
    X,
    Calendar,
    Clock,
    Scissors,
    User,
    CheckCircle2,
    CreditCard,
    XCircle
} from "lucide-react";

export function AppointmentDetailsModal({ isOpen, appointment, onClose }) {
    if (!isOpen || !appointment) return null;

    const totalPrice = appointment.services?.reduce((sum, service) => sum + (Number(service.price_at_booking) || 0), 0) || 0;

    const formattedDate = new Date(appointment.appointment_date).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'long',
        day: 'numeric'
    });

    const STATUS_MAP = {
        completed: {
            bgColor: "bg-emerald-500/10",
            textColor: "text-emerald-400",
            borderColor: "border-emerald-500/20",
            icon: CheckCircle2,
            label: "Completed",
        },
        cancelled: {
            bgColor: "bg-red-500/10",
            textColor: "text-red-400",
            borderColor: "border-red-500/20",
            icon: XCircle,
            label: "Cancelled",
        },
    };

    const statusConfig = STATUS_MAP[appointment.status];
    const Icon = statusConfig?.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
            <div
                className="w-full sm:max-w-md bg-[#1A1919] border border-white/10 rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all max-h-[90vh] flex flex-col"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
                <div className="relative p-5 pb-4 border-b border-white/10 bg-linear-to-b from-white/5 to-transparent">
                    <div className="flex items-center justify-between">
                        {statusConfig && (
                            <div className="flex items-center gap-2">
                                  <span
                                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor}`}
                                  >
                                    <Icon size={13}/>
                                      {statusConfig.label}
                                  </span>
                            </div>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={18}/>
                        </button>
                    </div>

                    <h2
                        className="text-[#F2EFE9] text-2xl font-bold mt-3"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Appointment Details
                    </h2>
                    <p className="text-gray-400 text-xs mt-0.5">
                        Appointment ID: #{appointment.appointment_id || "N/A"}
                    </p>
                </div>

                <div className="p-4 space-y-4 overflow-y-auto flex-1 text-[#F2EFE9]">
                    <div className="bg-[#242323] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                        {appointment.barber_photo_url ? (
                            <img
                                src={appointment.barber_photo_url}
                                alt="Barber"
                                className="w-14 h-14 rounded-xl object-cover border border-white/10 bg-[#333131]"
                            />
                        ) : (
                            <div className="w-14 h-14 rounded-xl bg-[#333131] border border-white/10 flex items-center justify-center text-[#DBB668]">
                                <User size={24} />
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                                Your Barber
                            </p>
                            <p className="text-base font-bold text-[#F2EFE9] truncate mt-0.5">
                                {appointment.barber_first_name ? `${appointment.barber_first_name} ${appointment.barber_last_name}` : "Barber"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pl-4 pr-4">
                    <div className="bg-[#242323] p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#DBB668]/10 flex items-center justify-center text-[#DBB668]">
                            <Calendar size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                                Date
                            </p>
                            <p className="text-xs font-semibold text-[#F2EFE9] capitalize truncate mt-0.5">
                                {formattedDate}
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#242323] p-3.5 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#DBB668]/10 flex items-center justify-center text-[#DBB668]">
                            <Clock size={18} />
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
                                Time
                            </p>
                            <p className="text-xs font-semibold text-[#F2EFE9] mt-0.5">
                                {appointment.start_time?.slice(0, 5) || "00:00"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1.5">
                        <Scissors size={14} className="text-[#DBB668]"/> Services
                    </p>
                    <div className="bg-[#242323] rounded-2xl p-4 border border-white/5 divide-y divide-white/5">
                        {appointment.services && appointment.services.length > 0 ? (
                            appointment.services.map((service, idx) => (
                                <div
                                    key={idx}
                                    className={`flex items-center justify-between ${
                                        idx !== 0 ? "pt-3" : ""
                                    } ${idx !== appointment.services.length - 1 ? "pb-3" : ""}`}
                                >
                                    <div>
                                        <p className="text-sm font-medium text-[#F2EFE9]">
                                            {service.service_name}
                                        </p>
                                        {service.duration && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {service.duration} min
                                            </p>
                                        )}
                                    </div>
                                    <span className="text-sm font-bold text-[#F2EFE9]">
                                        {service.price_at_booking} RON
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400">No services</p>
                        )}
                    </div>

                    <div className="bg-linear-to-r from-[#DBB668]/10 via-[#DBB668]/5 to-transparent p-4 rounded-2xl border border-[#DBB668]/20 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#DBB668] text-[#1A1919] flex items-center justify-center font-bold">
                                <CreditCard size={16} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-300 font-medium">Total to pay</p>
                            </div>
                        </div>
                        <span className="text-xl font-bold text-[#DBB668]">
                        {totalPrice} RON
                    </span>
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 bg-[#1A1919]">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-[#F2EFE9] font-semibold text-sm border border-white/10 transition-all active:scale-[0.98]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}