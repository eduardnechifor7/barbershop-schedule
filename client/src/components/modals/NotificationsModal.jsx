import { Bell, CheckCheck, X, Calendar, Sparkles, Trash2 } from "lucide-react";

export function NotificationsModal({ isOpen, onClose, notifications = [], onNotificationClick, onMarkAllAsRead, onDeleteNotification }) {
    if (!isOpen) return null;

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn select-none">
            <div className="relative w-full max-w-lg bg-[#1C1B1B] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">

                <div className="h-0.5 bg-linear-to-r from-brand-gold via-[#c9a155] to-transparent shrink-0" />

                <div className="p-5 pb-4 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#262424] flex items-center justify-center text-brand-gold border border-white/5">
                            <Bell size={18} />
                        </div>
                        <div>
                            <h2
                                className="text-xl font-bold text-[#F2EFE9] leading-tight"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                Notifications
                            </h2>
                            <p className="text-gray-400 text-xs">
                                {unreadCount > 0
                                    ? `${unreadCount} unread update${unreadCount > 1 ? "s" : ""}`
                                    : "You are all caught up"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/3 hover:bg-white/8 text-brand-gold text-xs font-medium border border-brand-gold/20 transition-all cursor-pointer"
                                title="Mark all as read"
                            >
                                <CheckCheck size={14} />
                                <span className="hidden sm:inline">Read all</span>
                            </button>
                        )}

                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl bg-[#262424] hover:bg-white/8 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-white/5"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div
                    className="flex-1 overflow-y-auto p-5 space-y-3"
                    style={{ scrollbarWidth: "none" }}
                >
                    {notifications.length > 0 ? (
                        notifications.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => onNotificationClick && onNotificationClick(item.id)}
                                className={`group relative w-full p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex gap-3.5 items-start ${
                                    item.is_read
                                        ? "bg-[#262424]/40 border-white/5 opacity-70 hover:opacity-100 hover:border-white/10"
                                        : "bg-[#262424] border-brand-gold/30 shadow-lg shadow-black/20"
                                }`}
                            >
                                <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                                        item.is_read
                                            ? "bg-white/5 text-gray-400"
                                            : "bg-brand-gold/10 text-brand-gold border border-brand-gold/20"
                                    }`}
                                >
                                    {item.title?.toLowerCase().includes("reminder") ? (
                                        <Calendar size={16} />
                                    ) : (
                                        <Sparkles size={16} />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <p
                                            className={`text-sm font-semibold truncate ${
                                                item.is_read ? "text-gray-300" : "text-[#F2EFE9]"
                                            }`}
                                        >
                                            {item.title}
                                        </p>

                                        {!item.is_read && (
                                            <span className="w-2 h-2 rounded-full bg-brand-gold shrink-0" />
                                        )}
                                    </div>

                                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                                        {item.message}
                                    </p>


                                    <span className="flex justify-between text-gray-500 text-[10px] mt-2 font-medium">
                                        {item.created_at
                                            ? new Date(item.created_at).toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })
                                            : "Just now"}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteNotification(item.id);
                                            }}
                                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                            title="Delete notification"
                                        >
                                        <Trash2 size={15} />
                                    </button>
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-center">
                            <div className="w-14 h-14 rounded-2xl bg-[#262424] flex items-center justify-center text-gray-500 mb-3 border border-white/5">
                                <Bell size={24} />
                            </div>
                            <p className="text-[#F2EFE9] font-medium text-sm">
                                No notifications yet
                            </p>
                            <p className="text-gray-500 text-xs mt-1 max-w-50">
                                We'll notify you about appointments and schedule updates here.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}