import { IconButton } from '@mui/material';
import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { setChats, selectChat } from "../../Slices/chatSlice"
import { apiUrl } from "../../services/url.service";
import {
    TextField,
    Box,
    Typography,
    Button,
    Chip,
    Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getAllUsers } from '../../services/userService';
import { Divider } from "@mui/material";
import { getConsistentColor } from "../../utils/RandomColor";

const CreateGroup = ({ onClose }) => {
    const [search, setSearch] = useState("");
    const [groupName, setGroupName] = useState("");
    const [allUser, setAllUser] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const dispatch = useDispatch();
    const chats = useSelector((state) => state.chats.chats);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target)
            ) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [onClose]);

    const handleSearch = async (value) => {
        setSearch(value);

        if (!value.trim()) {
            setSearchResults([]);
            return;
        }

        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                `${apiUrl}/api/users/search/${value}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const result = await res.json();
            const data = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);

            const filtered = data.filter(
                (user) => !selectedUsers.some((u) => u._id === user._id)
            );

            filtered.sort((a, b) =>
                a.username.localeCompare(b.username)
            );

            setSearchResults(filtered);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                const result = await getAllUsers();

                const currentUser = JSON.parse(localStorage.getItem("user"));
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

    const handleRemoveUser = (userId) => {
        setSelectedUsers(selectedUsers.filter((u) => u._id !== userId));
    };

    const handleCreateGroup = async () => {
        if (!groupName?.trim() || selectedUsers.length < 2) {
            alert("Enter a group name and add at least 2 members");
            return;
        }

        const token = localStorage.getItem("token");
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

        try {
            const res = await fetch(
                `${apiUrl}/api/conversations/creategroup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        name: groupName.trim(),
                        users: selectedUsers.map((u) => u._id),
                    }),
                }
            );

            const result = await res.json();

            if (!res.ok) {
                throw new Error(result.message || "Failed to create group");
            }

            const conversation = result.data;
            if (conversation) {
                dispatch(setChats([conversation, ...chats]));
                dispatch(selectChat(conversation));
            }

            setGroupName("");
            setSelectedUsers([]);
            onClose();
        } catch (error) {
            console.error("Create group error:", error);
            alert(error.message || "Failed to create group");
        }
    };
    return (
        <>
            <Box
                ref={containerRef}
                sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: {
                        xs: "100%",
                        md: "40%"
                    },
                    height: "100%",
                    bgcolor: "#f0f2f5",
                    boxShadow: "-2px 0 4px rgba(0,0,0,0.15)",
                    zIndex: 20,
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        py: 1,
                        bgcolor: "white",
                        borderBottom: "1px solid #ddd",
                    }}
                >
                    <Typography
                        sx={{
                            color: "rgb(30, 170, 97)",
                            fontWeight: "700",
                            fontSize: "20px",
                        }}
                    >
                        Create new group
                    </Typography>

                    <CloseIcon
                        sx={{ cursor: "pointer" }}
                        onClick={onClose}
                    />
                </Box>


                <Box
                    sx={{
                        width: "70%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mx: "auto",
                        my: 0
                    }}
                >
                    <TextField
                        label="Group Name"
                        variant="standard"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
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
                    />
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
                                {user.username[0]}
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
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                        px: 3,
                        overflowY: "auto",
                        listStyle: "none",
                        m: 0, flex: 1,
                        // maxHeight: "400px",
                    }}
                >
                    {(search ? searchResults : allUser)
                        .filter(
                            (user) =>
                                !selectedUsers.some((u) => u._id === user._id)
                        )
                        .map((user) => {
                            return (
                                <Box
                                    component="li"
                                    key={user._id}
                                    onClick={() => handleSelectUser(user)}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        cursor: "pointer",
                                        "&:hover": {
                                            backgroundColor: "#f5f5f5",
                                        },
                                    }}
                                >

                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            px: 2,
                                            py: 1,
                                        }}
                                    >

                                        <Avatar
                                            src={user.profilePicture}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                mr: 2,
                                                bgcolor: user.profilePicture ? "transparent" : getConsistentColor(user._id)
                                            }}
                                        >
                                            {user.username?.charAt(0)}
                                        </Avatar>


                                        <Box sx={{ flex: 1 }}>
                                            <Typography sx={{ fontWeight: 500 }}>
                                                {user.username}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                sx={{ color: "gray", fontSize: "12px" }}
                                            >
                                                About:{user.about || "Hey there! I'm using WhatsApp"}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* 🔹 Divider */}
                                    <Divider sx={{ ml: 8 }} />
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
                        onClick={handleCreateGroup}
                        disabled={!groupName?.trim() || selectedUsers.length < 2}
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

export default CreateGroup