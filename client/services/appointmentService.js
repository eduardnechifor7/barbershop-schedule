import { auth } from "../src/firebase.js";

const getAuthHeaders = async (contentType = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Session expired. Please log in again.");

    const token = await currentUser.getIdToken();
    const headers = { Authorization: `Bearer ${token}` };

    if (contentType) headers["Content-Type"] = "application/json";
    return headers;
};

export const appointmentService = {
    async getAll() {
        const headers = await getAuthHeaders();
        const response = await fetch("http://localhost:8080/api/appointments/list", {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch appointments");
        return response.json();
    },

    async edit(id, formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`http://localhost:8080/api/appointments/edit/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to edit appointment");
        return response;
    },

    async addAppointment(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`http://localhost:8080/api/appointments/addAppointment`, {
            method: "POST",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to add appointment");
        return response;
    },

    async delete(id) {
        const headers = await getAuthHeaders();
        const response = await fetch(`http://localhost:8080/api/appointments/delete/${id}`, {
            method: "DELETE",
            headers
        });
        if (!response.ok) throw new Error("Failed to delete appointment");
        return response;
    }
};