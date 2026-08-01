import { auth } from "../firebase.js";

const getAuthHeaders = async (contentType = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Session expired. Please log in again.");

    const token = await currentUser.getIdToken();
    const headers = { Authorization: `Bearer ${token}` };

    if (contentType) headers["Content-Type"] = "application/json";
    return headers;
};

export const servicesService = {
    async getAll() {
        const headers = await getAuthHeaders();
        const response = await fetch("http://localhost:8080/api/services/list", {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch services");
        return response.json();
    },

    async edit(id, formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`http://localhost:8080/api/services/edit/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to edit the service");
        return response;
    },

    async addService(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch("http://localhost:8080/api/services/create", {
            method: "POST",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to add the service");
        return response;
    },

    async delete(id) {
        const headers = await getAuthHeaders();
        const response = await fetch(`http://localhost:8080/api/services/delete/${id}`, {
            method: "DELETE",
            headers
        });
        if (!response.ok) throw new Error("Failed to delete the service");
        return response;
    }
};