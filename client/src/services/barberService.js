import { supabase } from "../supabase.js";

const getAuthHeaders = async (contentType = false) => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
        throw new Error("Session expired. Please log in again.");
    }

    const token = session.access_token;
    const headers = { Authorization: `Bearer ${token}` };

    if (contentType) headers["Content-Type"] = "application/json";
    return headers;
};

export const barberService = {
    async getAll() {
        const headers = await getAuthHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/barbers/list`, {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch barbers");
        return response.json();
    },

    async getMyProfile() {
        const headers = await getAuthHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/barbers/me`, {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch barber profile");
        return response.json();
    },

    async edit(id, formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/barbers/edit/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to edit barber");
        return response;
    },

    async addBarber(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/barbers/addBarber`, {
            method: "POST",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to add barber");
        return response;
    },


    async delete(id) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/barbers/delete/${id}`, {
            method: "DELETE",
            headers
        });
        if (!response.ok) throw new Error("Failed to delete barber");
        return response;
    }
};