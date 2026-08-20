import { auth } from "../firebase.js";

const getAuthHeaders = async (contentType = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Session expired. Please log in again.");

    const token = await currentUser.getIdToken();
    const headers = { Authorization: `Bearer ${token}` };

    if (contentType) headers["Content-Type"] = "application/json";
    return headers;
};

export const notificationService = {
    async getUserNotifications() {
        const headers = await getAuthHeaders();
        const response = await fetch("http://localhost:8080/api/notifications/list", {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch notifications");
        return response.json();
    },

    async markAsRead(id) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`http://localhost:8080/api/notifications/mark-as-read/${id}`, {
            method: "PUT",
            headers
        });
        if (!response.ok) throw new Error("Failed to mark notification as read");
        return response.json();
    },

    async markAllAsRead() {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`http://localhost:8080/api/notifications/mark-all-as-read`, {
            method: "PUT",
            headers
        });
        if (!response.ok) throw new Error("Failed to mark all notifications as read");
        return response.json();
    },

    async deleteNotification(id) {
        const headers = await getAuthHeaders();
        const response = await fetch(`http://localhost:8080/api/notifications/delete/${id}`, {
            method: "DELETE",
            headers
        });
        if (!response.ok) throw new Error("Failed to delete notification");
        return response.json();
    }
};