import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    Box,
    Typography,
    Avatar,
    Divider,
    List,
    TextField,
    ListItemAvatar,
    ListItemText,
    IconButton,
    CircularProgress,
    ListItemButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import Button from "@mui/material/Button";
import StarBorderIcon from '@mui/icons-material/StarBorder';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import Adduser from "../GroupSection/Adduser";
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LogoutIcon from '@mui/icons-material/Logout';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import { useTheme, useMediaQuery } from "@mui/material";
import { deleteConversation } from "../../services/conversation.service";
import { getSocket } from "../../services/chat.service";
import { toast } from "react-toastify";


const ChatDetailsPanel = ({ onClose }) => {
    const selectedChat = useSelector((state) => state.chats.selectedChat);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const dispatch = useDispatch();
    const [showDetails, setShowDetails] = useState(false);
    const [name, setName] = useState();
    const [editName, setEditName] = useState(false);
    const [fileData, setFileData] = useState("");
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));


    if (!selectedChat) return null;

    const isGroup = selectedChat.isGroupChat;
    const admin = typeof selectedChat.groupAdmin === "object" ? selectedChat.groupAdmin._id : selectedChat.groupAdmin;
    const adminIdStr = admin?.toString();
    const otherUser = !isGroup
        ? selectedChat.participants.find(
            (p) => String(p._id) !== String(currentUser?._id)
        )
        : null;

    const title = isGroup ? selectedChat.chatName : otherUser?.username;
    const subtitle = isGroup
        ? `${selectedChat.participants.length} participants`
        : otherUser?.phoneNumber || "WhatsApp contact";

    const handleUserRemove = async (userId) => {
        if (!selectedChat?._id || !userId) {
            alert("Invalid user or chat");
            return;
        }

        if (userId !== currentUser._id && adminIdStr !== currentUser._id?.toString()) {
            alert("Only admin can remove users");
            return;
        }
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(
                "http://localhost:3000/api/conversations/remove-user",
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        conversationId: selectedChat._id,
                        userId
                    })
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            dispatch({
                type: "chats/setSelectedChat",
                payload: data
            });

            // console.log("User removed:", data);

        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdate = async (e) => {
        if (e) e.preventDefault();
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("chatId", selectedChat._id);
        formData.append("chatName", name || selectedChat.chatName);

        if (fileData) {
            formData.append("profilePicture", fileData);
        }
        try {
            const res = await fetch(
                `http://localhost:3000/api/conversations/update-group`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );
            // console.log(res)
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            dispatch({
                type: "chats/addOrUpdateChat",
                payload: data.data
            });
            dispatch({
                type: "chats/setSelectedChat",
                payload: data.data
            });
            setEditName(false);

        } catch (error) {
            console.log(error.message);
        }
    };

    const handleDeleteChat = async () => {
        try {
            const res = await deleteConversation(selectedChat._id);

            if (res.status !== "success") {
                throw new Error(res.message);
            }

            const socket = getSocket();
            socket.emit("delete_conversation", {
                conversationId: selectedChat._id
            });
            dispatch({
                type: "chats/removeChat",
                payload: selectedChat._id
            });

            dispatch({
                type: "chats/setSelectedChat",
                payload: null
            });

            toast.success("chat deleted")
            onClose();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    };

    return (
        <Box
            sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: isMobile ? "100%" : "40%",
                minWidth: isMobile ? "100%" : 280,
                left: isMobile ? 0 : "auto",
                height: "100%",
                bgcolor: "#f0f2f5",
                boxShadow: "-2px 0 4px rgba(0,0,0,0.15)",
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 2,

                    py: 2,
                    bgcolor: "white",
                    borderBottom: "1px solid #ddd",
                }}
            >
                <Typography sx={{ fontWeight: 600, fontSize: 16 }}>
                    {isGroup ? "Group info" : "Contact info"}
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>


            {/* Content */}
            <Box sx={{ p: 3, overflowY: "auto", flex: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mb: 3,
                    }}
                >
                    {isGroup ? (<Avatar
                        sx={{
                            bgcolor: isGroup ? "#0b5ed7" : "#00a884",
                            width: 80,
                            height: 80,
                            fontSize: 36,
                            mb: 1.5,
                        }}
                        src={selectedChat?.groupPic}

                    >
                    </Avatar>) : (<Avatar
                        sx={{
                            bgcolor: isGroup ? "#0b5ed7" : "#00a884",
                            width: 80,
                            height: 80,
                            fontSize: 36,
                            mb: 1.5,
                        }}
                        src={otherUser?.profilePicture}

                    >
                    </Avatar>)}

                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {!isGroup ? title :
                            (<Box>
                                <Box component="form" encType='multipart/form-data' onSubmit={handleUpdate}
                                    sx={{ display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "center" }}>

                                    <input type='file' onChange={(e) => { setFileData(e.target.files[0]) }}></input>
                                    <Button type='submit' color='success'>Edit</Button>
                                </Box>
                            </Box>)}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mt: 0.5, textAlign: "center" }}
                    >
                        {subtitle}
                    </Typography>
                    {isGroup ? (
                        <>
                            <Box sx={{ mt: 4 }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <TextField
                                        variant="standard"
                                        label="Group Name"
                                        fullWidth
                                        value={name ?? title}
                                        disabled={!editName}
                                        onChange={(e) => setName(e.target.value)}
                                    />

                                    <IconButton
                                        onClick={() =>
                                            editName ? handleUpdate() : setEditName(true)
                                        }
                                    >
                                        {editName ? <CheckIcon /> : <EditIcon />}
                                    </IconButton>
                                </Box>
                            </Box>
                            <Button
                                variant="outlined"
                                onClick={() => setShowDetails(true)}
                                size="small"
                                sx={{
                                    mt: 3,
                                    borderRadius: "30px",
                                    px: 1,
                                    py: 1,
                                    boxShadow: 1,
                                    fontSize: "0.75rem",
                                    "&:hover": {
                                        backgroundColor: "rgb(25, 150, 85)",
                                    },
                                }}
                            >
                                Add User
                            </Button>
                        </>
                    ) : null}

                </Box>

                <Divider />

                {/* About */}
                <Box sx={{ mt: 2, mb: 2, display: "flex", flexDirection: "row" }}>
                    <Typography
                        variant="caption"
                        sx={{ textTransform: "uppercase", color: "text.secondary" }}
                    >
                        About
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        {isGroup
                            ? "This is a group chat. You can see all members below."
                            : otherUser?.about}
                    </Typography>
                </Box>
                <Divider></Divider>
                {/* {other details} */}


                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        py: 2,
                        gap: 2,
                        my: 3,
                    }}
                >
                    {[
                        { icon: <StarBorderIcon />, text: "Starred messages" },
                        { icon: <NotificationsIcon />, text: "Mute notifications" },
                        { icon: <CircularProgress size={20} />, text: "Disappearing messages" },
                        { icon: <SecurityIcon />, text: "Advanced chat privacy" },
                        { icon: <LockIcon />, text: "Encryption" },
                    ].map((item, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                px: 2,
                                py: 1.5,
                                borderRadius: "12px",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    backgroundColor: "rgba(0,0,0,0.05)",
                                },
                            }}
                        >
                            {item.icon}
                            <Typography variant="body1">{item.text}</Typography>
                        </Box>
                    ))}
                </Box>

                {/* Participants list for group */}
                {isGroup && (
                    <>
                        <Divider />
                        <Box onClick={() => setShowDetails(true)}
                            size="small"
                            sx={{ py: 2, display: "flex", flexDirection: "row", alignContent: "center", color: "#25D366" }}>
                            <GroupAddIcon sx={{
                                mx: 1
                            }}></GroupAddIcon>
                            <Typography>Add Member</Typography>
                        </Box>
                        <Box sx={{ mt: 2 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    textTransform: "uppercase",
                                    color: "text.secondary",
                                }}
                            >
                                Participants
                            </Typography>
                            <List dense>
                                {selectedChat.participants.map((p) => (
                                    <ListItemButton key={p._id}  >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: "#e0f2f1", color: "black" }} src={p.profilePicture ? p.profilePicture : p.username?.charAt(0)}>


                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={p.username}
                                            secondary={p.phoneNumber || undefined}
                                            onClick={() => { navigator.clipboard.writeText(p.phoneNumber) }}
                                            sx={{
                                                "&:hover": {
                                                    color: "#25D366"
                                                }
                                            }}
                                        />

                                        {adminIdStr === p._id ? (
                                            <Typography
                                                sx={{
                                                    fontSize: "0.75rem",
                                                    fontWeight: 600,
                                                    color: "#25D366",          // WhatsApp green
                                                    border: "1px solid #25D366",
                                                    borderRadius: "12px",
                                                    px: 1,
                                                    py: 0.2,
                                                    display: "inline-block",
                                                    ml: 1
                                                }}
                                            >
                                                Admin
                                            </Typography>
                                        ) : (
                                            adminIdStr === currentUser._id ? (
                                                <RemoveCircleIcon onClick={() => { handleUserRemove(p._id) }} sx={{
                                                    color: "error.main",

                                                }}></RemoveCircleIcon>
                                            ) : null
                                        )}

                                    </ListItemButton>
                                ))}
                            </List>

                        </Box>
                        <Divider />

                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                                alignItems: "center"
                            }}
                        >
                            <IconButton
                                sx={{
                                    width: "80%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 1,
                                    p: 1.2,
                                    borderRadius: 2,
                                    "&:hover": {
                                        backgroundColor: "#f5f5f5",
                                    },
                                }}

                            >
                                <FavoriteBorderIcon fontSize="small" />
                                <Typography>Add to favourites</Typography>
                            </IconButton>

                            {adminIdStr !== currentUser._id?.toString() && (<IconButton

                                onClick={() => { handleUserRemove(currentUser._id) }}
                                sx={{
                                    width: "80%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 1,
                                    p: 1.2,
                                    borderRadius: 2,
                                    color: "error.main",
                                    "&:hover": {
                                        backgroundColor: "#ffe6e6",
                                    },
                                }}
                            >
                                <LogoutIcon fontSize="small" />
                                <Typography>Exit group</Typography>
                            </IconButton>)}

                            {adminIdStr === currentUser._id?.toString() ? (<IconButton
                                onClick={handleDeleteChat}
                                sx={{

                                    width: "80%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    gap: 1,
                                    p: 1.2,
                                    borderRadius: 2,
                                    color: "error.main",
                                    "&:hover": {
                                        backgroundColor: "#ffe6e6",
                                    },
                                }}
                            >
                                <DeleteIcon fontSize="small"></DeleteIcon>

                                <Typography>Delete group</Typography>
                            </IconButton>) : ""}

                        </Box>
                    </>
                )}

                {!isGroup && otherUser && (
                    <>
                        <Divider />
                        <Box sx={{ mt: 2, my: 3 }}>
                            <Typography
                                variant="caption"
                                sx={{
                                    textTransform: "uppercase",
                                    color: "text.secondary",
                                }}
                            >
                                Contact info
                            </Typography>
                            <Typography variant="body2" sx={{
                                mt: 1,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between"
                            }}>
                                Phone: {otherUser.phoneNumber || "Not available"}
                                <IconButton size="small" onClick={() => { navigator.clipboard.writeText(otherUser.phone) }}>
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>

                            </Typography>
                        </Box>
                        <Divider />

                        <Box
                            sx={{
                                py: 2,
                                px: 2,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    cursor: "pointer",
                                    p: 1,
                                    borderRadius: 2,
                                    "&:hover": {
                                        backgroundColor: "#f5f5f5"
                                    }
                                }}
                            >
                                <FavoriteBorderIcon fontSize="small" />
                                <Typography>Add to favourites</Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    cursor: "pointer",
                                    p: 1,
                                    borderRadius: 2,
                                    color: "error.main",
                                    "&:hover": {
                                        backgroundColor: "#ffe6e6"
                                    }
                                }}
                            >
                                <LogoutIcon fontSize="small" />
                                <Typography onClick={handleDeleteChat}>Delete chat</Typography>
                            </Box>

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    cursor: "pointer",
                                    p: 1,
                                    borderRadius: 2,
                                    color: "error.main",
                                    "&:hover": {
                                        backgroundColor: "#ffe6e6"
                                    }
                                }}
                            >
                                <ThumbDownOffAltIcon fontSize="small" />
                                <Typography>Report {otherUser.name}</Typography>
                            </Box>
                        </Box>
                    </>
                )}


            </Box>
            {showDetails && (
                <Adduser onClose={() => setShowDetails(false)} />
            )}
        </Box>
    );
};

export default ChatDetailsPanel;

