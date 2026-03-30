import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    users: [],
    onlineUsers: [],
    loading: false,
};

const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        setInitialOnlineUsers: (state, action) => {
            state.onlineUsers = action.payload;
        },
        setOnlineUsers: (state, action) => {
            const { userId, isOnline } = action.payload;

            const id = String(userId);

            if (isOnline) {
                if (!state.onlineUsers.includes(id)) {
                    state.onlineUsers = [...state.onlineUsers, id];
                }
            } else {
                state.onlineUsers = state.onlineUsers.filter(
                    (uid) => uid !== id
                );
            }
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
    },
});

export const { setUsers, setInitialOnlineUsers, setOnlineUsers, setLoading } = userSlice.actions;
export default userSlice.reducer;

