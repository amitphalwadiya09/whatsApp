import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    chats: [],
    selectedChat: null,
    currentUserId: null,
};

const chatSlice = createSlice({
    name: "chats",
    initialState,
    reducers: {
        setChats: (state, action) => {
            // Sort chats by lastMessage timestamp (most recent first)
            const sortedChats = [...action.payload].sort((a, b) => {
                const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.updatedAt);
                const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.updatedAt);
                return bTime - aTime; // Most recent first
            });
            state.chats = sortedChats;
        },
        removeChat: (state, action) => {
            const chatId = action.payload;
            state.chats = state.chats.filter((c) => c._id !== chatId);
            if (state.selectedChat?._id === chatId) {
                state.selectedChat = null;
            }
        },
        addOrUpdateChat: (state, action) => {
            const chat = action.payload;
            if (!chat?._id) return;

            const existingIndex = state.chats.findIndex(
                (c) => c._id === chat._id
            );

            if (existingIndex === -1) {
                // Add new chat and sort by lastMessage timestamp
                const newChat = {
                    ...chat,
                    unreadCount: chat.unreadCount ?? 0,
                };
                state.chats.push(newChat);

                // Sort chats by lastMessage timestamp (most recent first)
                state.chats.sort((a, b) => {
                    const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.updatedAt);
                    const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.updatedAt);
                    return bTime - aTime; // Most recent first
                });
            } else {
                // Update existing chat
                state.chats[existingIndex] = {
                    ...state.chats[existingIndex],
                    ...chat,
                };
            }
        },

        selectChat: (state, action) => {
            state.selectedChat = action.payload;

            // If payload is null just return
            if (!action.payload) return;

            const chatIndex = state.chats.findIndex(
                (c) => c._id === action.payload._id
            );

            if (chatIndex !== -1) {
                state.chats[chatIndex].unreadCount = 0;
            }
        },
        setCurrentUserId: (state, action) => {
            state.currentUserId = action.payload;
        },
        updateLastMessage: (state, action) => {
            const { conversationId, message } = action.payload;

            const chatIndex = state.chats.findIndex(
                (c) => c._id === conversationId
            );

            if (chatIndex !== -1) {

                state.chats[chatIndex].lastMessage = {
                    ...message,
                    content: message.content || "",
                };

                const senderId =
                    message.sender?._id || message.sender;

                const isMessageFromOtherUser =
                    String(senderId) !== String(state.currentUserId);

                const isChatOpen =
                    state.selectedChat?._id === conversationId;

                if (isMessageFromOtherUser && !isChatOpen) {
                    state.chats[chatIndex].unreadCount =
                        (state.chats[chatIndex].unreadCount || 0) + 1;
                }

                // move chat to top
                const updatedChat = state.chats.splice(chatIndex, 1)[0];
                state.chats.unshift(updatedChat)
            }
        },
        updateLastMessageStatus: (state, action) => {
            const { messageId, messageStatus } = action.payload;

            state.chats.forEach((chat) => {
                if (chat.lastMessage?._id === messageId) {
                    chat.lastMessage.messageStatus = messageStatus;
                }
            });
        }
    },

});

export const { setChats, addOrUpdateChat, removeChat, selectChat, updateLastMessage, setCurrentUserId, updateLastMessageStatus } = chatSlice.actions;

export default chatSlice.reducer;
