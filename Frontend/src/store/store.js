import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Slices/authSlice";
import userReducer from "../Slices/userSlice";
import chatReducer from '../Slices/chatSlice';
import messageReducer from '../Slices/messageSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        users: userReducer,
        chats: chatReducer,
        messages: messageReducer,
    }
});