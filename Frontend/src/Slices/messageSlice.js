
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    messages: [],
    activeConversationId: null,
    typingUsers: {},
};

const messageSlice = createSlice({
    name: "messages",
    initialState,
    reducers: {
        setActiveConversation: (state, action) => {
            state.activeConversationId = action.payload;
            state.messages = [];
        },

        setMessages: (state, action) => {
            state.messages = action.payload;
        },

        addMessage: (state, action) => {
            const exists = state.messages.find(
                (msg) => msg._id === action.payload._id
            );

            if (!exists) {
                state.messages.push(action.payload);
            }
        },

        markMessagesSeen: (state, action) => {

            const messageId = action.payload;

            const message = state.messages.find(
                msg => msg._id === messageId
            );

            if (message) {
                message.messageStatus = "read";
            }

        },
        updateMessageStatus: (state, action) => {

            const { messageId, messageStatus } = action.payload;

            const message = state.messages.find(
                msg => msg._id === messageId
            );

            if (message) {
                message.messageStatus = messageStatus;
            }

        },
        addReaction: (state, action) => {

            const { messageId, reactions } = action.payload;

            const messageIndex = state.messages.findIndex(
                msg => msg._id === messageId
            );

            if (messageIndex !== -1) {
                state.messages[messageIndex].reactions = reactions;
            }

        },
        deleteMessage: (state, action) => {

            const messageId = action.payload;

            state.messages = state.messages.filter(
                msg => msg._id !== messageId
            );

        },
        userTyping: (state, action) => {

            const { userId, conversationId, isTyping } = action.payload;

            if (!state.typingUsers[conversationId]) {
                state.typingUsers[conversationId] = {};
            }

            if (isTyping) {
                state.typingUsers[conversationId][userId] = true;
            } else {
                delete state.typingUsers[conversationId][userId];
            }
        },

        clearMessages: (state) => {
            state.messages = [];
        },
    },
});

export const {
    setMessages,
    addMessage,
    clearMessages,
    setActiveConversation,
    markMessagesSeen,
    addReaction,
    deleteMessage,
    userTyping,
    updateMessageStatus
} = messageSlice.actions;

export default messageSlice.reducer;
