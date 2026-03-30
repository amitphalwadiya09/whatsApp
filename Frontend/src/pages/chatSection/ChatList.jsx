import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatHeader from "./ChatHeader";
import { getAllUsers } from "../../services/userService";
import { getUserConversations, createConversation } from "../../services/conversation.service";
import { setChats, selectChat, setCurrentUserId, addOrUpdateChat } from "../../Slices/chatSlice";
import { setInitialOnlineUsers } from "../../Slices/userSlice";
import { Box, Typography, Avatar, TextField, Divider } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { getSocket } from "../../services/chat.service";
import { getRandomRGB } from "../../utils/RandomColor";

const ChatList = () => {
    const dispatch = useDispatch();
    const { chats } = useSelector((state) => state.chats);
    const typingUsers = useSelector((state) => state.messages.typingUsers);

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const socket = getSocket();

    const [allUsers, setAllUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    // ✅ Auto exit search
    useEffect(() => {
        if (!searchText) setIsSearching(false);
    }, [searchText]);

    // ✅ Set current user
    useEffect(() => {
        if (currentUser?._id) {
            dispatch(setCurrentUserId(currentUser._id));
        }
    }, [currentUser?._id]);

    // ✅ Fetch users
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await getAllUsers();
            if (res.status === "success") {
                setAllUsers(res.data);

                const onlineIds = res.data
                    .filter((u) => u.isOnline)
                    .map((u) => String(u._id));

                dispatch(setInitialOnlineUsers(onlineIds));
            }
        };
        fetchUsers();
    }, []);

    // ✅ Fetch chats
    useEffect(() => {
        const fetchChats = async () => {
            const res = await getUserConversations();
            if (res.status === "success") {
                dispatch(setChats(res.data));
            }
        };
        fetchChats();
    }, [dispatch]);

    // ✅ Create conversation
    const handleCreateConversation = async (userId) => {
        const res = await createConversation(userId);
        const chat = res.data;

        const exists = chats.find((c) => c._id === chat._id);
        if (!exists) dispatch(addOrUpdateChat(chat));

        socket.emit("join chat", chat._id);
        dispatch(selectChat(chat));
        setSearchText("");
    };

    // ✅ Search logic (merge users + chats)
    // SEARCH LOGIC (safe)
    const results = [
        // Users
        ...allUsers
            .filter(user => user?._id !== currentUser._id && (user.username || "").toLowerCase().includes((searchText || "").toLowerCase()))
            .map(user => {
                const chat = chats.find(c =>
                    !c.isGroupChat &&
                    c.participants.some(p => p._id === user._id)
                );
                return { type: "user", user, chat: chat || null };
            }),

        // Groups
        ...chats
            .filter(c => c.isGroupChat && c.participants.some(p => p._id === currentUser._id))
            .filter(c => (c.chatName || "").toLowerCase().includes((searchText || "").toLowerCase()))
            .map(c => ({ type: "group", chat: c, user: null })),
    ];

    // ✅ Typing check
    const isTyping = (chatId) => {
        const typing = typingUsers?.[chatId] || {};
        return Object.keys(typing).some((id) => id !== currentUser?._id);
    };

    const formatTime = (date) => {
        if (!date) return "";

        const d = new Date(date);
        return d.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getMessageStatusIcon = (chat) => {
        const msg = chat?.lastMessage;

        // show only if current user is sender
        if (!msg || msg.sender?._id !== currentUser._id) return null;

        switch (msg.messageStatus) {
            case "sent":
                return <span style={{ fontSize: 12, color: "#667781" }}>✓</span>;

            case "delivered":
                return <span style={{ fontSize: 12, color: "#667781" }}>✓✓</span>;

            case "read":
                return <span style={{ fontSize: 12, color: "#06cf9c" }}>✓✓</span>;

            default:
                return null;
        }
    };

    const getLastMessageText = (chat, otherUser) => {
        const msg = chat?.lastMessage;
        if (!msg || msg.contentType === "system") {
            return otherUser?.about || "No messages yet";
        }

        return msg.content || otherUser?.about || "No messages yet";
    };

    return (
        <Box sx={{ height: "100vh", bgcolor: "#f0f2f5" }}>

            {/* ✅ HEADER */}
            {!isSearching && <ChatHeader />}

            {/* ✅ SEARCH BAR */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1,
                    bgcolor: "#f0f2f5",
                    ml: isSearching ? 0 : 2,
                    mr: isSearching ? 0 : 2,
                    mt: isSearching ? 0 : 1,
                    borderRadius: isSearching ? 0 : 1,
                    mb: 1,
                    border: isSearching ? "none" : "1px solid #e9edef",
                }}
            >
                {isSearching ? (
                    <ArrowBackIcon
                        sx={{ ml: 1, mr: 2, cursor: "pointer", color: "#667781" }}
                        onClick={() => {
                            setIsSearching(false);
                            setSearchText("");
                        }}
                    />
                ) : (
                    <SearchIcon sx={{ mx: 1, color: "#667781" }} />
                )}

                <TextField
                    value={searchText}
                    onFocus={() => setIsSearching(true)}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search or start new chat"
                    variant="standard"
                    fullWidth
                    InputProps={{ disableUnderline: true }}
                    sx={{
                        "& .MuiInputBase-input": {
                            color: "#111b21",
                            fontSize: "14px",
                        },
                        "& .MuiInputBase-input::placeholder": {
                            color: "#667781",
                            opacity: 1,
                        }
                    }}
                />
            </Box>

            {/* ✅ NORMAL CHAT LIST */}
            {!isSearching ? (
                <Box sx={{ overflowY: "auto", bgcolor: "white" }}>
                    {chats.map((chat) => {
                        // console.log(chat)
                        const otherUser = chat.participants.find(
                            (p) => p._id !== currentUser._id
                        );
                        const isGroup = chat.isGroupChat;
                        const groupPic = chat.groupPic;
                        const chatName = isGroup ? chat.chatName : otherUser?.username;
                        // console.log(chat)
                        const unread =
                            chat.unreadCount > 0 &&
                            chat.lastMessage?.sender?._id !== currentUser._id

                        return (

                            <>
                                <Box
                                    key={chat._id}
                                    onClick={() => dispatch(selectChat(chat))}
                                    sx={{
                                        display: "flex",
                                        p: 1.5,
                                        cursor: "pointer",
                                        "&:hover": { bgcolor: "#f5f5f5" },
                                        borderBottom: "1px solid #e9edef",
                                    }}
                                >
                                    <Avatar sx={{ bgcolor: !isGroup && otherUser?.profilePicture ? "transparent" : getRandomRGB() }}
                                        src={isGroup ? groupPic : otherUser?.profilePicture} />

                                    {/* TEXT AREA */}
                                    <Box sx={{ flex: 1, ml: 2 }}>
                                        <Typography sx={{ fontWeight: 500, color: "#111b21", fontSize: "16px" }}>
                                            {chatName}
                                        </Typography>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                            {getMessageStatusIcon(chat)}
                                            <Typography
                                                sx={{
                                                    fontSize: "14px",
                                                    color: unread
                                                        ? "#06cf9c"
                                                        : isTyping(chat._id)
                                                            ? "#06cf9c"
                                                            : "#667781",
                                                    fontStyle: isTyping(chat._id)
                                                        ? "italic"
                                                        : "normal",
                                                    fontWeight: unread ? 500 : 400,
                                                }}
                                            >
                                                {isTyping(chat._id)
                                                    ? "Typing..."
                                                    : getLastMessageText(chat, otherUser)}
                                            </Typography>
                                        </Box>

                                    </Box>

                                    {/* RIGHT SIDE */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                            justifyContent: "space-around",
                                        }}
                                    >
                                        {/* TIME */}
                                        <Typography
                                            sx={{
                                                fontSize: "12px",
                                                color: unread ? "#06cf9c" : "#667781",
                                            }}
                                        >
                                            {formatTime(chat.lastMessage?.createdAt)}
                                        </Typography>

                                        {/* UNREAD COUNT */}
                                        {unread && (
                                            <Box
                                                sx={{
                                                    mt: .5,
                                                    minWidth: 20,
                                                    height: 20,
                                                    px: 1,
                                                    bgcolor: "#06cf9c",
                                                    color: "#fff",
                                                    borderRadius: "10px",
                                                    fontSize: "12px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {chat.unreadCount}
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </>
                        );
                    })}


                </Box>
            ) : (
                /* ✅ SEARCH LIST */
                <Box sx={{ overflowY: "auto", bgcolor: "white" }}>
                    {results.map(result => {
                        const { type, user, chat } = result;
                        const isGroup = type === "group" || chat?.isGroupChat;

                        const displayName = isGroup
                            ? chat.chatName
                            : user?.username;

                        const avatarSrc = isGroup
                            ? chat?.groupPic
                            : user?.profilePicture;

                        // Determine unread
                        const unread =
                            chat?.unreadCount > 0 &&
                            chat?.lastMessage?.sender?._id !== currentUser._id;

                        return (
                            <Box
                                key={chat?._id || user?._id}
                                onClick={() =>
                                    chat
                                        ? dispatch(selectChat(chat))
                                        : handleCreateConversation(user._id)
                                }
                                sx={{
                                    display: "flex",
                                    p: 1.5,
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "#f5f5f5" },
                                    borderBottom: "1px solid #e9edef",
                                }}
                            >
                                <Avatar src={avatarSrc} />

                                {/* TEXT */}
                                <Box sx={{ flex: 1, ml: 2 }}>
                                    <Typography sx={{ fontWeight: 500, color: "#111b21", fontSize: "16px" }}>
                                        {displayName}
                                    </Typography>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        {chat && getMessageStatusIcon(chat)}
                                        <Typography
                                            sx={{
                                                fontSize: "14px",
                                                color: unread
                                                    ? "#06cf9c"
                                                    : chat ? "#667781" : "gray",
                                                fontStyle: chat ? "normal" : "italic",
                                                fontWeight: unread ? 500 : 400,
                                            }}
                                        >
                                            {chat && chat.contentType != "system"
                                                ? chat.lastMessage?.content || "No messages yet"
                                                : user?.about || "Hey there! I'm using WhatsApp"}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* RIGHT SIDE */}
                                {chat && (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                fontSize: "12px",
                                                color: unread ? "#06cf9c" : "#667781",
                                            }}
                                        >
                                            {formatTime(chat.lastMessage?.createdAt)}
                                        </Typography>

                                        {unread && (
                                            <Box
                                                sx={{
                                                    mt: 1,
                                                    minWidth: 20,
                                                    height: 20,
                                                    px: 1,
                                                    bgcolor: "#06cf9c",
                                                    color: "#fff",
                                                    borderRadius: "10px",
                                                    fontSize: "12px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {chat.unreadCount}
                                            </Box>

                                        )}

                                    </Box>
                                )}



                            </Box>

                        );
                    })}

                </Box>
            )}
        </Box>
    );
};

export default ChatList;
