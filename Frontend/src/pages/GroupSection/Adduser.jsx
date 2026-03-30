
import { Divider, IconButton } from '@mui/material';
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { setChats, selectChat } from "../../Slices/chatSlice"
import {
    TextField,
    Box,
    Typography,
    Button,
    Chip,
    Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect } from 'react';
import { getAllUsers } from '../../services/userService';

const Adduser = ({ onClose }) => {
    const [search, setSearch] = useState("");
    const [allUser, setAllUser] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const dispatch = useDispatch();
    const chats = useSelector((state) => state.chats.chats);
    const selectedChat = useSelector((state) => state.chats.selectedChat);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const isAdmin = selectedChat?.groupAdmin?._id === currentUser?._id;

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const result = await getAllUsers();

                if (result.status === "success") {
                    setAllUser(
                        result.data.filter(user => user._id !== currentUser._id)
                    );
                }
            } catch (error) {
                console.log(error);
            }
        };

        fetchAllUsers();
    }, []);

    const handleSelectUser = (user) => {
        if (!selectedUsers.find((u) => u._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
        }

        setSearch("");
        setSearchResults([]);
    };

    const handleSearch = (value) => {
        setSearch(value);

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        const filtered = allUser
            .filter((user) =>
                user.username.toLowerCase().includes(value.toLowerCase())
            )
            .filter(
                (user) =>
                    !selectedUsers.some((u) => u._id === user._id) &&
                    !selectedChat?.participants?.some(
                        (member) => member._id === user._id
                    )
            )
            .sort((a, b) => a.username.localeCompare(b.username));

        setSearchResults(filtered);
    };

    const handleRemoveUser = async (userId) => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                "http://localhost:3000/api/conversations/remove-user",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        conversationId: selectedChat._id,
                        userId,
                    }),
                }
            );

            const updatedChat = await res.json();

            if (!res.ok) throw new Error(updatedChat.message);

            dispatch(selectChat(updatedChat));

            dispatch(
                setChats(
                    chats.map((chat) =>
                        chat._id === updatedChat._id ? updatedChat : chat
                    )
                )
            );

        } catch (error) {
            console.log(error.message);
        }
    };

    const handleAddUser = async () => {
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                "http://localhost:3000/api/conversations/add-user",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        conversationId: selectedChat._id,
                        userIds: selectedUsers.map((u) => u._id),
                    }),
                }
            );

            const updatedChat = await res.json();

            if (!res.ok) {
                throw new Error(updatedChat.message);
            }


            dispatch(selectChat(updatedChat));

            dispatch(
                setChats(
                    chats.map((chat) =>
                        chat._id === updatedChat._id ? updatedChat : chat
                    )
                )
            );

            setSelectedUsers([]);
            onClose();

        } catch (error) {
            console.log(error.message);
        }
    };
    return (
        <>
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "100%",
                    minWidth: 280,
                    height: "100%",
                    bgcolor: "#f0f2f5",
                    boxShadow: "-2px 0 4px rgba(0,0,0,0.15)",
                    zIndex: 20,
                    display: "flex",
                    flexDirection: "column",

                }}
            >
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,
                    py: 1,
                    bgcolor: "white",
                    borderBottom: "1px solid #ddd",
                }}>
                    <Typography sx={{
                        color: "rgb(30, 170, 97)",
                        fontWeight: "700",
                        fontSize: "20px"
                    }}>
                        Add member
                    </Typography>

                    <CloseIcon onClick={onClose}></CloseIcon>
                </Box>

                <Box sx={{
                    width: "70%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mx: "auto"
                }}>
                    <TextField
                        label="Search member"
                        variant="standard"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        sx={{
                            width: "100%",
                            textAlign: "center",
                            "& .MuiInputBase-input": {
                                textAlign: "center",
                            },
                            "& .MuiInput-underline:before": {
                                borderBottomColor: "#ccc",
                            },
                            "& .MuiInput-underline:hover:before": {
                                borderBottomColor: "#000",
                            },
                            "& .MuiInput-underline:after": {
                                borderBottomColor: "#1976d2",
                            },
                        }}
                    /></Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 1, mx: 1 }}>
                    {selectedUsers.map((user) => (
                        <Chip
                            key={user._id}
                            size="small"
                            label={user.username}
                            avatar={<Avatar sx={{ width: 20, height: 20, fontSize: 12 }} src={user.profilePicture}>
                                {user.username?.[0]}
                            </Avatar>}
                            onDelete={() => handleRemoveUser(user._id)}
                            sx={{
                                backgroundColor: "rgb(30, 170, 97)",
                                color: "white",
                                fontSize: "12px",
                                height: 24,
                            }}
                            deleteIcon={<CloseIcon sx={{ fontSize: 16, color: "white !important" }} />}
                        />
                    ))}
                </Box>
                <Box
                    component="ul"
                    sx={{
                        px: 3,
                        overflowY: "auto",
                        listStyle: "none",
                        m: 0, flex: 1,

                    }}
                >
                    {(search ? searchResults : allUser)
                        .filter(
                            (user) =>
                                !selectedUsers.some((u) => u._id === user._id) &&
                                !selectedChat?.participants?.some(
                                    (member) => member._id === user._id
                                )
                        )
                        .map((user) => {
                            return (
                                <Box
                                    component="li"
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    sx={{ p: 0 }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            width: "100%",
                                            px: 1.5,
                                            py: 1,
                                            cursor: "pointer",
                                            "&:hover": {
                                                backgroundColor: "#f5f5f5",
                                            },
                                        }}
                                    >
                                        {/* Avatar + online indicator */}
                                        <Box sx={{ position: "relative" }}>
                                            <Avatar src={user.profilePicture} />
                                            {user.isOnline && (
                                                <Box
                                                    sx={{
                                                        position: "absolute",
                                                        bottom: 0,
                                                        right: 0,
                                                        width: 10,
                                                        height: 10,
                                                        bgcolor: "#25D366",
                                                        borderRadius: "50%",
                                                        border: "2px solid white",
                                                    }}
                                                />
                                            )}
                                        </Box>

                                        {/* User info */}
                                        <Box sx={{ flex: 1, ml: 3 }}>
                                            <Typography sx={{ fontWeight: 500 }}>
                                                {user.username}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{ color: "gray", fontSize: "12px" }}
                                            >
                                                About: {user.about || "Hey there! I'm using WhatsApp"}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Divider */}
                                    <Divider sx={{ ml: 7 }} />
                                </Box>
                            );
                        })}
                </Box>


                <Box
                    sx={{
                        position: "sticky",
                        bottom: 0,
                        display: "flex",
                        justifyContent: "center",
                        py: 2,
                        bgcolor: "#f0f2f5",
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={handleAddUser}
                        disabled={selectedUsers.length === 0}
                        sx={{
                            minWidth: 0,
                            width: 56,
                            height: 56,
                            borderRadius: "50%",
                            backgroundColor: "rgb(30, 170, 97)",
                            boxShadow: 3,
                            "&:hover": {
                                backgroundColor: "rgb(25,150,85)",
                            },
                        }}

                    >
                        <ArrowForwardIcon sx={{ color: "black" }} />
                    </Button>
                </Box>
            </Box></>
    )
}
export default Adduser