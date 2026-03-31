import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getSocket } from "./chat.service";
import {
    updateLastMessage,
    removeChat,
    selectChat,
    updateLastMessageStatus,
    updateUnreadCount
} from "../Slices/chatSlice";
import { addOrUpdateChat } from "../Slices/chatSlice";
import {
    addMessage,
    markMessagesSeen,
    addReaction,
    deleteMessage,
    userTyping,
    updateMessageStatus
} from "../Slices/messageSlice";

import { setOnlineUsers, setInitialOnlineUsers } from "../Slices/userSlice";

const SocketManager = () => {

    const socket = getSocket();

    const dispatch = useDispatch();
    const selectedChat = useSelector((state) => state.chats.selectedChat);

    const selectedChatRef = useRef(null);

    useEffect(() => {
        const emitUserConnected = () => {
            const user = JSON.parse(localStorage.getItem("user"));
            if (user?._id) {
                console.log("🔌 Emitting user_connected for:", user._id);
                socket.emit("user_connected", user._id);
            }
        };

        if (socket.connected) {
            console.log("🔌 Socket already connected, emitting user_connected");
            emitUserConnected();
        } else {
            console.log("🔌 Socket not connected, waiting for connect event");
            socket.on("connect", () => {
                console.log("🔌 Socket connected event received");
                emitUserConnected();
            });
        }

        return () => {
            socket.off("connect", emitUserConnected);
        };
    }, [socket]);

    useEffect(() => {
        selectedChatRef.current = selectedChat;
    }, [selectedChat]);


    useEffect(() => {

        const handleReceiveMessage = (message) => {
            // console.log("New message:", message);

            const convId = message.conversation?._id || message.conversation;

            dispatch(updateLastMessage({
                conversationId: convId,
                message
            }));

            if (selectedChatRef.current?._id === convId) {
                dispatch(addMessage(message));

                const currentUser = JSON.parse(localStorage.getItem("user"));
                const currentUserId = currentUser?._id;
                const senderId = message.sender?._id || message.sender;

                if (senderId !== currentUserId) {
                    socket.emit("message_read", {
                        messageIds: [message._id],
                        senderId: senderId
                    });
                }
            }
        };

        // Handle message delivered status (batch)
        const handleMessageDelivered = ({ ids, conversationId, status }) => {
            if (Array.isArray(ids)) {
                ids.forEach(messageId => {
                    dispatch(updateMessageStatus({ messageId, messageStatus: status || "delivered" }));
                    dispatch(updateLastMessageStatus({ messageId, messageStatus: status || "delivered" }));
                });
            }
        };

        // Handle message read status (batch)
        const handleMessageRead = ({ ids, conversationId, status, readAt }) => {
            if (Array.isArray(ids)) {
                ids.forEach(messageId => {
                    dispatch(updateMessageStatus({ messageId, messageStatus: status || "read" }));
                    dispatch(updateLastMessageStatus({ messageId, messageStatus: status || "read" }));
                });
            } else if (conversationId) {
                // Batch update for whole conversation
                dispatch(markMessagesSeen(conversationId));
                // Reset unread count when messages are read
                dispatch(updateUnreadCount({ conversationId, unreadCount: 0 }));
            }
        };

        const handleMessageStatusUpdate = ({ messageId, messageStatus }) => {
            // Legacy handler for backward compatibility
            if (messageStatus === "read") {
                dispatch(markMessagesSeen(messageId));
            } else {
                dispatch(updateMessageStatus({ messageId, messageStatus }));
            }
            dispatch(updateLastMessageStatus({ messageId, messageStatus }));
        };

        const handleUserStatus = ({ userId, isOnline }) => {
            console.log("📡 User status update:", { userId, isOnline });
            dispatch(setOnlineUsers({ userId, isOnline }));
        };

        const handleOnlineUsers = (onlineUserIds) => {
            console.log("📡 Online users list:", onlineUserIds);
            dispatch(setInitialOnlineUsers(onlineUserIds.map(id => String(id))));
        };

        const handleReactionUpdate = ({ messageId, reactions }) => {

            dispatch(addReaction({ messageId, reactions }))
        };

        const handleConversationDeleted = (conversationId) => {

            dispatch(removeChat(conversationId));

            if (selectedChatRef.current?._id === conversationId) {
                dispatch(selectChat(null));
            }
        };

        const handleTyping = ({ userId, conversationId, isTyping }) => {

            dispatch(userTyping({ userId, conversationId, isTyping }));
        };

        const handleMessageSend = (message) => {
            dispatch(addMessage(message));
        };

        const handleMessageDeleted = (deletemessageId) => {
            dispatch(deleteMessage(deletemessageId))
        };

        const handleMessageError = (error) => {
            console.error(error);
        };
        const handleNewConversation = (conversation) => {
            dispatch(addOrUpdateChat(conversation));
        };
        const handleUserRemoved = ({ conversationId, userId, updatedConversation }) => {

            const currentUser = JSON.parse(localStorage.getItem("user"));

            // If YOU were removed
            if (currentUser._id === userId) {

                dispatch(removeChat(conversationId));

                if (selectedChatRef.current?._id === conversationId) {
                    dispatch(selectChat(null));
                }

                return;
            }

            // Otherwise update conversation
            dispatch(addOrUpdateChat(updatedConversation));

            if (selectedChatRef.current?._id === conversationId) {
                dispatch(selectChat(updatedConversation));
            }
        };
        const handleConversationUpdated = (conversation) => {
            dispatch(addOrUpdateChat(conversation));

            if (selectedChatRef.current?._id === conversation._id) {
                dispatch(selectChat(conversation));
            }
        };

        socket.on("receive_message", handleReceiveMessage);
        // Listen to all status update events
        socket.on("message_Status_update", handleMessageStatusUpdate);
        socket.on("message_delivered", handleMessageDelivered);
        socket.on("message_read", handleMessageRead);
        socket.on("messages_read", handleMessageRead);
        socket.on("user_status", handleUserStatus);
        socket.on("online_users", handleOnlineUsers);
        socket.on("reaction_update", handleReactionUpdate);
        socket.on("user_typing", handleTyping);
        socket.on("conversation_deleted", handleConversationDeleted);
        socket.on("message_send", handleMessageSend);
        socket.on("message_delete", handleMessageDeleted);
        socket.on("message_deleted", handleMessageDeleted); // support backend legacy/alternate event
        socket.on("message_error", handleMessageError);
        socket.on("new_conversation", handleNewConversation);
        socket.on("userRemoved", handleUserRemoved);
        socket.on("conversation_updated", handleConversationUpdated);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("message_Status_update", handleMessageStatusUpdate);
            socket.off("message_delivered", handleMessageDelivered);
            socket.off("message_read", handleMessageRead);
            socket.off("messages_read", handleMessageRead);
            socket.off("user_status", handleUserStatus);
            socket.off("online_users", handleOnlineUsers);
            socket.off("reaction_update", handleReactionUpdate);
            socket.off("user_typing", handleTyping);
            socket.off("conversation_deleted", handleConversationDeleted);
            socket.off("message_send", handleMessageSend);
            socket.off("message_delete", handleMessageDeleted);
            socket.off("message_deleted", handleMessageDeleted);
            socket.off("message_error", handleMessageError);
            socket.off("new_conversation", handleNewConversation);
            socket.off("userRemoved", handleUserRemoved);
            socket.off("conversation_updated", handleConversationUpdated);
        };

    }, [dispatch, socket]);

    useEffect(() => {

        if (selectedChat?._id) {
            socket.emit("join chat", selectedChat._id);
        }

    }, [selectedChat, socket]);

    return null;
};

export default SocketManager;