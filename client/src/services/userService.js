import { auth } from "../firebase.js";

const getAuthHeaders = async (contentType = false) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Session expired. Please log in again.");

    const token = await currentUser.getIdToken();
    const headers = { Authorization: `Bearer ${token}` };

    if (contentType) headers["Content-Type"] = "application/json";
    return headers;
};

export const userService = {
    async getAll() {
        const headers = await getAuthHeaders();
        const response = await fetch("http://localhost:8080/api/users/list", { headers });
        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
    },

    async addUser(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch("http://localhost:8080/api/users/sync", {
            method: "POST",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to add user");
        return response.json();
    },

    async getProfile() {
        const headers = await getAuthHeaders();
        const response = await fetch("http://localhost:8080/api/users/by-uid", {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch user");
        return response.json();
    },

    async updateNotifcationSettings(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch("http://localhost:8080/api/users/update-notification", {
            method: "PATCH",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to update notification settings");
        return response;
    },

    async getClients() {
        const headers = await getAuthHeaders();
        const response = await fetch("http://localhost:8080/api/users/clients", {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch clients");
        return response.json();
    },

    async edit(id, formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`http://localhost:8080/api/users/edit/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to edit user");
        return response;
    },

    async editPhoneNumber(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch("http://localhost:8080/api/users/edit-phone", {
            method: "PATCH",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to edit phone number");
        return response;
    },

    async delete(id) {
        const headers = await getAuthHeaders();
        const response = await fetch(`http://localhost:8080/api/users/delete/${id}`, {
            method: "DELETE",
            headers
        });
        if (!response.ok) throw new Error("Failed to delete user");
        return response;
    }
};