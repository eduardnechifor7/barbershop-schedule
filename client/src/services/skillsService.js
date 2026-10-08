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

export const skillsService = {
    async getAll() {
        const headers = await getAuthHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/list`, {
            method: "GET",
            headers
        });
        if (!response.ok) throw new Error("Failed to fetch skills");
        return response.json();
    },

    async addSkill(name) {
        const headers = await getAuthHeaders(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/add`, {
            method: "POST",
            headers,
            body: JSON.stringify({ name })
        });
        if (!response.ok) throw new Error("Failed to add skill");
        return response.json();
    },

    async deleteSkill(id) {
        const headers = await getAuthHeaders();
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/skills/delete/${id}`, {
            method: "DELETE",
            headers
        });
        if (!response.ok) throw new Error("Failed to delete skill");
        return response.json();
    }
}