import { io } from "socket.io-client";

let socket = null;

const ENDPOINT = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const initializeSocket = () => {

    if (socket) return socket;

    socket = io(ENDPOINT, {
        withCredentials: true,
        transports: ["websocket"],
        autoConnect: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
        console.log("⚠️ Socket disconnected:", reason);
    });

    return socket;
};

export const getSocket = () => {

    if (!socket) {
        socket = initializeSocket();
    }

    return socket;
};

export const disconnectSocket = () => {

    if (socket) {
        socket.disconnect();
        socket = null;
    }
};