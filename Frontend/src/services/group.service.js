// group.service.js

import axiosInstance from "./url.service";

export const addUserToGroup = async (conversationId, userIds) => {

    const response = await axiosInstance.put(
        "/api/conversations/add-user",
        { conversationId, userIds }
    );

    return response.data;
};

export const removeUserFromGroup = async (conversationId, userId) => {

    const response = await axiosInstance.put(
        "/api/conversations/remove-user",
        { conversationId, userId }
    );

    return response.data;
};

