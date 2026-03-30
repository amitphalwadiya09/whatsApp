import axiosInstance from "./url.service";

// CREATE OR GET CONVERSATION
export const createConversation = async (receiverId) => {
    try {

        const response = await axiosInstance.post(
            "/api/conversations",
            { receiverId }
        );

        return response.data;

    } catch (error) {

        throw error.response ? error.response.data : error.message;

    }
};

// GET USER CONVERSATIONS
export const getUserConversations = async () => {

    try {

        const response = await axiosInstance.get("/api/conversations");

        return response.data;

    } catch (error) {

        throw error.response ? error.response.data : error.message;

    }
};

// DELETE CONVERSATION
export const deleteConversation = async (conversationId) => {

    try {

        const response = await axiosInstance.delete(
            `/api/conversations/delete/${conversationId}`
        );

        return response.data;

    } catch (error) {

        throw error.response ? error.response.data : error.message;

    }
};

// RESET UNREAD COUNT
export const resetUnreadCount = async (conversationId) => {

    try {

        const response = await axiosInstance.put(
            "/api/conversations/reset-unread",
            { conversationId }
        );

        return response.data;

    } catch (error) {

        throw error.response ? error.response.data : error.message;

    }
};