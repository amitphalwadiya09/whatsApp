import axiosInstance from "./url.service";


// SEND MESSAGE
export const sendMessage = async (formData) => {
    try {

        const response = await axiosInstance.post(
            "/api/chat/send-message",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;

    } catch (error) {

        throw error.response ? error.response.data : error.message;

    }
};


// GET MESSAGES OF CONVERSATION
export const getMessages = async (conversationId) => {

    try {

        const response = await axiosInstance.get(
            `/api/chat/conversations/${conversationId}/messages`
        );

        return response.data;

    } catch (error) {

        throw error.response ? error.response.data : error.message;

    }
};


// MARK MESSAGE AS READ
export const markMessagesAsRead = async (messageIds) => {

    try {

        const response = await axiosInstance.put(
            "/api/chat/messages/read",
            { messageIds }
        );

        return response.data;

    } catch (error) {

        throw error.response ? error.response.data : error.message;

    }
};


// DELETE MESSAGE
export const deleteMessage = async ({ messageId }) => {

    try {

        const response = await axiosInstance.delete(
            `/api/chat/messages/${messageId}`
        );

        return response.data;

    } catch (error) {

        throw error.response ? error.response.data : error.message;

    }
};

export const markgroupmessageAsSeen = async (messageId) => {

    try {

        const response = await axiosInstance.put(
            "/api/chat/messages/seen",
            { messageId }
        );

        return response.data;

    } catch (error) {

        throw error.response ? error.response.data : error.message;

    }
};