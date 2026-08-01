import { auth } from "../firebase.js";

const getAuthHeaders = async (contentType = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Session expired. Please log in again.");

    const token = await currentUser.getIdToken();
    const headers = { Authorization: `Bearer ${token}` };

    if (contentType) headers["Content-Type"] = "application/json";
    return headers;
};

export const barberService = {
    async getAll() {
        const response = await fetch("http://localhost:8080/api/barbers/list");
        if (!response.ok) throw new Error("Failed to fetch barbers");
        return response.json();
    },

    async getBarberById(id) {
        const headers = await getAuthHeaders();
        const response = await fetch(`http://localhost:8080/api/barbers/${id}`, {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch barber");
        return response.json();
    },

    async edit(id, formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`http://localhost:8080/api/barbers/edit/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to edit barber");
        return response;
    },

    async addBarber(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`http://localhost:8080/api/barbers/addBarber`, {
            method: "POST",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to add barber");
        return response;
    },


    async delete(id) {
        const headers = await getAuthHeaders();
        const response = await fetch(`http://localhost:8080/api/barbers/delete/${id}`, {
            method: "DELETE",
            headers
        });
        if (!response.ok) throw new Error("Failed to delete barber");
        return response;
    }
};