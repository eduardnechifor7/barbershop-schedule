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

export const appointmentService = {
    async getAll() {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/list`, {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch appointments");
        return response.json();
    },

    async getByUser() {
        const headers = await getAuthHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/me`, {
            method: "GET",
            headers
        });
        if(!response.ok) throw new Error("Failed to fetch user appointments");
        return response.json();
    },

    async getAsBarber() {
        const headers = await getAuthHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/list-as-barber`, {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch barber appointments");
        return response.json();
    },

    async editAsBarber(id, formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/edit-as-barber/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to edit appointment as barber");
        return response;
    },

    async createAsBarber(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/create-as-barber`, {
            method: "POST",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to create appointment as barber");
        return response;
    },

    async getOccupiedTimes(barberId, date) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/${barberId}/existing-bookings?date=${date}`, {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch occupied times");
        return response.json();
    },

    async edit(id, formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/edit/${id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to edit appointment");
        return response;
    },

    async addAppointment(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/addAppointment`, {
            method: "POST",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to add appointment");
        return response;
    },

    async addAppointmentUser(formData) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/me/addAppointment`, {
            method: "POST",
            headers,
            body: JSON.stringify(formData)
        });
        if (!response.ok) throw new Error("Failed to add appointment for user");
        return response;
    },

    async delete(id) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/delete/${id}`, {
            method: "DELETE",
            headers
        });
        if (!response.ok) throw new Error("Failed to delete appointment");
        return response;
    },

    async deleteAsUser(id) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/appointments/me/cancel/${id}`, {
            method: "PATCH",
            headers
        });
        if (!response.ok) throw new Error("Failed to delete appointment");
        return response;
    }
};