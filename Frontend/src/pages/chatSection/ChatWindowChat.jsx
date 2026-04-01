import React, { useEffect, useRef, useMemo, useCallback, useState } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import bg from "../../assets/bg.jpeg";
import { deleteMessage, getMessages, markgroupmessageAsSeen, markMessagesAsRead } from "../../services/message.service";
import { setMessages } from "../../Slices/messageSlice";
import { getSocket } from "../../services/chat.service";
import MessageMenu from "./MessageMenu";

const ChatWindowChat = () => {
    const dispatch = useDispatch();
    const selectedChat = useSelector((state) => state.chats.selectedChat);
    const messages = useSelector((state) => state.messages.messages);
    const typingUsers = useSelector((state) => state.messages.typingUsers);
    const onlineUsers = useSelector((state) => state.users.onlineUsers);
    const socket = getSocket();
    const currentUser = JSON.parse(localStorage.getItem("user"));


    const ITEM_HEIGHT = 48;

    // ✅ Memoize receiver calculation
    const receiver = useMemo(() => 
        selectedChat?.participants?.find(
            (p) => p?._id && String(p._id) !== String(currentUser?._id)
        ), 
        [selectedChat?.participants, currentUser?._id]
    );

    // ✅ Memoize online status
    const isUserOnline = useMemo(
        () => receiver ? onlineUsers.includes(String(receiver._id)) : false,
        [receiver, onlineUsers]
    );

    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedMsg, setSelectedMsg] = useState(null);

    const userInfo = JSON.parse(localStorage.getItem("user"));
    const messagesEndRef = useRef(null);

    const isGroupChat = selectedChat?.isGroupChat;
    const UserInGroup = selectedChat?.participants?.length || 0;

    // ✅ Memoize typing check
    const isTyping = useMemo(
        () =>
            !!selectedChat?._id &&
            !!userInfo?._id &&
            !!typingUsers[selectedChat._id] &&
            Object.keys(typingUsers[selectedChat._id]).some(
                (userId) => userId !== String(userInfo._id)
            ),
        [selectedChat?._id, userInfo?._id, typingUsers]
    );

    // ✅ Memoize unseen messages for group chat
    const unseenMessages = useMemo(
        () => {
            if (!isGroupChat || !messages.length) return [];
            return messages
                .filter(
                    (m) =>
                        !m.messageSeenBy?.includes(userInfo._id) &&
                        String(m.sender) !== String(userInfo._id)
                )
                .map((m) => m._id);
        },
        [messages, isGroupChat, userInfo._id]
    );

    // ✅ Memoize unread messages
    const unreadMessages = useMemo(
        () => {
            if (!messages.length || !userInfo?._id) return [];
            return messages
                .filter(
                    (m) =>
                        (m.receiver === userInfo._id ||
                            (typeof m.receiver === "object" &&
                                m.receiver?._id === userInfo._id)) &&
                        m.messageStatus !== "read"
                )
                .map((m) => m._id);
        },
        [messages, userInfo._id]
    );

    useEffect(() => {
        const markGroupSeen = async () => {
            if (!unseenMessages.length) return;

            try {
                await markgroupmessageAsSeen(unseenMessages);
            } catch (err) {
                console.error(err);
            }
        };

        markGroupSeen();
    }, [unseenMessages]);

    // mark messages as read for current user
    useEffect(() => {
        const markSeen = async () => {
            if (!unreadMessages.length) return;

            try {
                await markMessagesAsRead(unreadMessages);
            } catch (e) {
                console.error("Error marking messages as read:", e);
            }
        };

        markSeen();
    }, [unreadMessages]);

    // ✅ Memoize helpers and event handlers
    const getDateLabel = useCallback((date) => {
        const messageDate = new Date(date);
        const today = new Date();
        const yesterday = new Date();

        yesterday.setDate(today.getDate() - 1);

        const isToday =
            messageDate.toDateString() === today.toDateString();

        const isYesterday =
            messageDate.toDateString() === yesterday.toDateString();

        if (isToday) return "Today";
        if (isYesterday) return "Yesterday";

        const diffInDays =
            (today - messageDate) / (1000 * 60 * 60 * 24);

        if (diffInDays < 7) {
            return messageDate.toLocaleDateString(undefined, {
                weekday: "long",
            });
        }

        return messageDate.toLocaleDateString();
    }, []);

    const handleDownload = useCallback(async (url) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();

            const link = document.createElement("a");
            link.href = window.URL.createObjectURL(blob);
            link.download = url.split("/").pop(); // dynamic filename
            link.click();
        } catch (error) {
            console.error("Download failed", error);
        }
    }, []);

    const handleDelete = useCallback(async (messageId) => {
        await deleteMessage({ messageId });
        socket.emit("message_delete", {
            messageId,
            conversationId: selectedChat._id,
        });
    }, [socket, selectedChat._id]);

    const handleMenuOpen = useCallback((event, msg) => {
        setAnchorEl(event.currentTarget);
        setSelectedMsg(msg);
    }, []);

    const handleMenuClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    // fetch messages when chat changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedChat?._id) return;
            try {
                const data = await getMessages(selectedChat._id);
                dispatch(setMessages(data.data));
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };

        if (selectedChat) {
            fetchMessages();
        }
    }, [selectedChat, dispatch]);

    // auto scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <>
            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 1,
                    py: 1,
                    pb: 12,
                    backgroundImage: `url(${bg})`,
                    backgroundRepeat: "repeat",

                }}
            >
                <Box sx={{ mb: 2 }}>
                    {messages.map((msg, index) => {
                        const currentDate = new Date(msg.createdAt).toDateString();
                        // console.log(msg)
                        const seenUsers = msg?.messageSeenBy.length || 0;
                        const previousDate =
                            index > 0
                                ? new Date(
                                    messages[index - 1].createdAt
                                ).toDateString()
                                : null;

                        const shouldShowDate = currentDate !== previousDate;

                        const senderId =
                            typeof msg.sender === "object"
                                ? msg.sender._id
                                : msg.sender;

                        const currentUserId = userInfo?._id;

                        const isMyMessage =
                            String(senderId) === String(currentUserId);

                        const time = new Date(msg.createdAt).toLocaleTimeString(
                            [],
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                            }
                        );

                        // System message rendering
                        if (msg.contentType === "system" || msg.isSystemMessage) {
                            return (
                                <Box
                                    key={msg._id}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        my: 1.5,
                                        width: "100%"
                                    }}
                                >
                                    <Box
                                        sx={{
                                            px: 2,
                                            py: 0.8,
                                            bgcolor: "#f0f0f0",
                                            borderRadius: "12px",
                                            fontSize: "13px",
                                            color: "#666",
                                            fontStyle: "italic",
                                            maxWidth: "80%",
                                            textAlign: "center"
                                        }}
                                    >
                                        {msg.content}
                                    </Box>
                                </Box>
                            );
                        }

                        return (
                            <Box
                                key={msg._id}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: isMyMessage
                                        ? "flex-end"
                                        : "flex-start",


                                    mb: 1,
                                    mr: 0
                                }}
                            >
                                {shouldShowDate && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            justifyContent: "center",
                                            my: 1,
                                            width: "100%",
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                px: 2,
                                                py: 0.5,
                                                bgcolor: "#e1f3fb",
                                                borderRadius: "20px",
                                                fontSize: "14px",
                                                color: "#555",
                                            }}
                                        >
                                            {getDateLabel(msg.createdAt)}
                                        </Box>
                                    </Box>
                                )}

                                <Box
                                    sx={{
                                        position: "relative",
                                        maxWidth: "50%",
                                        pr: 3,
                                        pl: 2,
                                        pt:
                                            selectedChat?.isGroupChat &&
                                                !isMyMessage
                                                ? .8
                                                : 1.2,
                                        pb: 2,
                                        borderRadius: 3,
                                        borderTopRightRadius: isMyMessage ? 0 : 12,
                                        borderTopLeftRadius: isMyMessage ? 12 : 0,
                                        bgcolor: isMyMessage
                                            ? "#dcf8c6"
                                            : "#ffffff",
                                        boxShadow:
                                            "0 1px 0.5px rgba(0,0,0,0.13)",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, msg)}
                                        sx={{
                                            position: "absolute",
                                            top: 2,
                                            right: 2,
                                            p: 0,            // Remove extra padding
                                            minWidth: 20,    // Reduce minimum width
                                            fontSize: "16px"
                                        }}
                                    >
                                        ⋮
                                    </IconButton>

                                    <MessageMenu
                                        anchorEl={anchorEl}
                                        handleClose={handleMenuClose}
                                        selectedMsg={selectedMsg}
                                        onDelete={handleDelete}
                                    />


                                    {selectedChat?.isGroupChat && !isMyMessage && (
                                        <Typography
                                            sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                                color: "#1976d2",
                                                mb: 0,
                                            }}
                                        >
                                            {typeof msg.sender === "object"
                                                ? msg.sender.username
                                                : selectedChat.participants.find(
                                                    (p) => p._id === msg.sender
                                                )?.username}
                                        </Typography>
                                    )}

                                    <Box sx={{ fontSize: "14px" }}>
                                        {msg.contentType === "text" && (
                                            <Typography
                                                sx={{
                                                    fontSize: "14px",
                                                    // pr: 1,
                                                    fontStyle: msg.isMessageDeleted ? "italic" : "normal",
                                                    color: msg.isMessageDeleted ? "gray" : "inherit",
                                                    opacity: msg.isMessageDeleted ? 0.7 : 1,
                                                }}
                                            >
                                                {msg.isMessageDeleted ? "This message was deleted" : msg.content}
                                            </Typography>
                                        )}

                                        {msg.contentType === "image" && (
                                            <Box sx={{ position: "relative", display: "inline-block" }}>
                                                <img
                                                    src={msg.imageOrVideoUrl}
                                                    alt="img"
                                                    style={{
                                                        maxWidth: "200px",
                                                        borderRadius: "10px"
                                                    }}
                                                />

                                                {/* Download Button */}
                                                <IconButton
                                                    onClick={() => handleDownload(msg.imageOrVideoUrl)}
                                                    sx={{
                                                        position: "absolute",
                                                        bottom: 5,
                                                        right: 5,
                                                        bgcolor: "rgba(0,0,0,0.5)",
                                                        color: "#fff",
                                                        "&:hover": {
                                                            bgcolor: "rgba(0,0,0,0.7)",
                                                        },
                                                        width: 30,
                                                        height: 30,
                                                        p: 0.5,
                                                        borderRadius: "50%",
                                                    }}
                                                    size="small"
                                                >
                                                    ⬇
                                                </IconButton>
                                            </Box>
                                        )}

                                        {msg.contentType === "statusReaction" && (
                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontSize: "12px",
                                                        fontWeight: 700,
                                                        color: "#555",
                                                        mb: 0.3,
                                                    }}
                                                >
                                                    Reacted to your status
                                                </Typography>
                                                <Typography
                                                    sx={{
                                                        pr: 1,
                                                        gap: 0.5,
                                                        fontSize: "14px",
                                                        fontStyle: "italic",
                                                        color: "#4a4a4a",
                                                        opacity: 0.9,
                                                        fontWeight: 500,

                                                    }}
                                                >
                                                    {msg.content}
                                                </Typography>
                                            </Box>
                                        )}

                                        {msg.contentType === "video" && (
                                            <video
                                                src={msg.imageOrVideoUrl}
                                                controls
                                                style={{
                                                    maxWidth: "200px",
                                                    borderRadius: "10px"
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Box
                                        sx={{
                                            position: "absolute",
                                            bottom: 4,
                                            right: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 0.5,
                                        }}
                                    >
                                        <Typography sx={{ fontSize: "9px", pt: 1 }}>
                                            {time}
                                        </Typography>


                                        {isMyMessage && (
                                            <Typography
                                                sx={{
                                                    fontSize: "9px",
                                                    pt: 1,
                                                    color:
                                                        isGroupChat
                                                            ? (seenUsers >= UserInGroup - 1 ? "#4fc3f7" : "gray")
                                                            : (msg.messageStatus === "read" ? "#4fc3f7" : "gray"),
                                                }}
                                            >
                                                {isGroupChat
                                                    ? (
                                                        seenUsers >= UserInGroup - 1
                                                            ? "✓✓"
                                                            : "✓✓"
                                                    )
                                                    : (
                                                        msg.messageStatus === "read"
                                                            ? "✓✓"
                                                            : isUserOnline
                                                                ? "✓✓"
                                                                : "✓"
                                                    )}
                                            </Typography>
                                        )}


                                    </Box>
                                </Box>
                            </Box>
                        );
                    })}



                    {isTyping && (

                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "flex-start",
                                mb: 2,
                                p: 1,
                            }}
                        >
                            <Box
                                sx={{
                                    maxWidth: "60%",
                                    // px: 2,
                                    py: 1,
                                    borderRadius: "18px",
                                    borderTopLeftRadius: 4,
                                    backgroundColor: "#ffffff",
                                    boxShadow: "0 1px 0.5px rgba(0,0,0,0.13)",
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "14px",
                                        color: "#0fd75c",
                                        fontStyle: "italic",
                                        letterSpacing: "0.3px",
                                        animation: "typingBlur 1s infinite ease-in-out",
                                    }}
                                >
                                    typing...
                                </Typography>

                                <style>
                                    {`
            @keyframes typingBlur {
                0%, 100% {
                    opacity: 0.8;
                    filter: blur(0.5px);
                }
                50% {
                    opacity: 1;
                    filter: blur(0px);
                }
            }
            `}
                                </style>
                            </Box>
                        </Box>
                    )}


                    <div ref={messagesEndRef} />
                </Box>
            </Box>
        </>
    );
};

export default ChatWindowChat;

