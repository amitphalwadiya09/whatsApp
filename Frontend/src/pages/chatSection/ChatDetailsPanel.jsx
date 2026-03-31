import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiUrl } from "../../services/url.service";
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
    Button,
    Chip,
    Switch,
    FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
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
import PhotoIcon from '@mui/icons-material/Photo';
import VideocamIcon from '@mui/icons-material/Videocam';
import DescriptionIcon from '@mui/icons-material/Description';
import LinkIcon from '@mui/icons-material/Link';
import { useTheme, useMediaQuery } from "@mui/material";
import { deleteConversation } from "../../services/conversation.service";
import { getSocket } from "../../services/chat.service";
import { toast } from "react-toastify";
import { getConsistentColor } from "../../utils/RandomColor";


const ChatDetailsPanel = ({ onClose }) => {
    const selectedChat = useSelector((state) => state.chats.selectedChat);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const dispatch = useDispatch();
    const [showDetails, setShowDetails] = useState(false);
    const [name, setName] = useState();
    const [editName, setEditName] = useState(false);
    const [fileData, setFileData] = useState("");
    const [muteNotifications, setMuteNotifications] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
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
                `${apiUrl}/api/conversations/remove-user`,
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
                `${apiUrl}/api/conversations/update-group`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            );
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
            ref={containerRef}
            sx={{
                position: "absolute",
                top: 0,
                right: 0,
                width: isMobile ? "100%" : "35%",
                minWidth: isMobile ? "100%" : "30%",
                left: isMobile ? 0 : "auto",
                height: "100%",
                bgcolor: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                boxShadow: isMobile ? "none" : "-4px 0 20px rgba(0,0,0,0.08)",
                zIndex: 20,
                display: "flex",
                flexDirection: "column",
                // overflow: "hidden",
                backdropFilter: "blur(10px)",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 3,
                    py: 1.5,
                    bgcolor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    minHeight: 60,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
            >
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{
                        color: "#54656f",
                        bgcolor: "rgba(0,0,0,0.04)",
                        borderRadius: "50%",
                        width: 36,
                        height: 36,
                        transition: "all 0.2s ease",
                        "&:hover": {
                            bgcolor: "rgba(0,0,0,0.08)",
                            transform: "scale(1.05)",
                        }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: 18,
                        color: "#111b21",
                        flex: 1,
                        textAlign: "center",
                        mr: 4,
                        letterSpacing: 0.5,
                    }}
                >
                    {isGroup ? "Group info" : "Contact info"}
                </Typography>
            </Box>

            {/* Scrollable Content */}
            <Box
                onClick={(e) => e.stopPropagation()}
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                        width: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "2px",
                        "&:hover": {
                            background: "rgba(0,0,0,0.3)",
                        }
                    },
                }}
            >
                {/* Profile Section */}
                <Box
                    sx={{
                        bgcolor: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(10px)",
                        px: 3,
                        py: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(0,0,0,0.06)",
                        position: "relative",
                        "&::before": {
                            content: '""',
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: "4px",
                            background: "linear-gradient(90deg, #00a884, #25d366, #00a884)",
                            borderRadius: "0 0 4px 4px",
                        }
                    }}
                >
                    <Box sx={{ position: "relative", mb: 3 }}>
                        <Avatar
                            sx={{
                                width: 140,
                                height: 140,
                                bgcolor: (isGroup ? !selectedChat?.groupPic : !otherUser?.profilePicture)
                                    ? getConsistentColor(isGroup ? selectedChat?._id : otherUser?._id)
                                    : isGroup
                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        : "linear-gradient(135deg, #00a884 0%, #25d366 100%)",
                                fontSize: 56,
                                fontWeight: 300,
                                border: "4px solid rgba(255,255,255,0.9)",
                                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                                transition: "transform 0.3s ease",
                                "&:hover": {
                                    transform: "scale(1.05)",
                                }
                            }}
                            src={isGroup ? selectedChat?.groupPic : otherUser?.profilePicture}
                        >
                            {isGroup ? title?.charAt(0).toUpperCase() : otherUser?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        {!isGroup && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    bottom: 8,
                                    right: 8,
                                    width: 24,
                                    height: 24,
                                    bgcolor: "#25d366",
                                    borderRadius: "50%",
                                    border: "3px solid white",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                                }}
                            />
                        )}
                    </Box>

                    <Box sx={{ textAlign: "center", width: "100%" }}>
                        {isGroup ? (
                            <Box sx={{ mb: 2 }}>
                                {editName ? (
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        justifyContent: "center",
                                        bgcolor: "rgba(0,0,0,0.04)",
                                        borderRadius: 2,
                                        p: 1
                                    }}>
                                        <TextField
                                            size="small"
                                            value={name ?? title}
                                            onChange={(e) => setName(e.target.value)}
                                            sx={{
                                                "& .MuiOutlinedInput-root": {
                                                    fontSize: 20,
                                                    fontWeight: 500,
                                                    bgcolor: "white",
                                                    borderRadius: 1,
                                                }
                                            }}
                                        />
                                        <IconButton size="small" onClick={() => handleUpdate()}>
                                            <CheckIcon sx={{ color: "#00a884" }} />
                                        </IconButton>
                                    </Box>
                                ) : (
                                    <Box sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        justifyContent: "center",
                                        cursor: "pointer",
                                        p: 1,
                                        borderRadius: 2,
                                        transition: "background-color 0.2s ease",
                                        "&:hover": {
                                            bgcolor: "rgba(0,0,0,0.04)",
                                        }
                                    }}>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: 22,
                                                color: "#111b21",
                                                textAlign: "center",
                                                letterSpacing: 0.5,
                                            }}
                                        >
                                            {title}
                                        </Typography>
                                        <IconButton size="small" onClick={() => setEditName(true)}>
                                            <EditIcon sx={{ color: "#54656f", fontSize: 20 }} />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    fontSize: 22,
                                    color: "#111b21",
                                    mb: 1,
                                    letterSpacing: 0.5,
                                }}
                            >
                                {title}
                            </Typography>
                        )}

                        <Typography
                            sx={{
                                fontSize: 15,
                                color: "#54656f",
                                mb: 3,
                                fontWeight: 400,
                            }}
                        >
                            {subtitle}
                        </Typography>

                        {isGroup && adminIdStr === currentUser._id?.toString() && (
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        setFileData(e.target.files[0]);
                                        // Auto-update when file is selected
                                        setTimeout(() => handleUpdate(), 100);
                                    }}
                                    style={{ display: 'none' }}
                                    id="group-profile-upload"
                                />
                                <label htmlFor="group-profile-upload">
                                    <Button
                                        component="span"
                                        variant="outlined"
                                        startIcon={<PhotoIcon />}
                                        sx={{
                                            borderColor: "#00a884",
                                            color: "#00a884",
                                            borderRadius: 3,
                                            px: 3,
                                            py: 1,
                                            textTransform: "none",
                                            fontSize: 14,
                                            fontWeight: 500,
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                borderColor: "#25d366",
                                                color: "#25d366",
                                                bgcolor: "rgba(0,168,132,0.04)",
                                            }
                                        }}
                                    >
                                        Change Group Photo
                                    </Button>
                                </label>
                            </Box>
                        )}

                        {isGroup && (
                            <Button
                                variant="contained"
                                startIcon={<GroupAddIcon />}
                                onClick={() => setShowDetails(true)}
                                sx={{
                                    bgcolor: "#00a884",
                                    color: "white",
                                    borderRadius: 3,
                                    px: 4,
                                    py: 1.2,
                                    textTransform: "none",
                                    fontSize: 15,
                                    fontWeight: 500,
                                    boxShadow: "0 4px 12px rgba(0,168,132,0.3)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        bgcolor: "#25d366",
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 6px 20px rgba(0,168,132,0.4)",
                                    }
                                }}
                            >
                                Add participant
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Media, Links, Docs Section */}
                <Box sx={{
                    bgcolor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(10px)",
                    mt: 1,
                    borderBottom: "1px solid rgba(0,0,0,0.06)"
                }}>
                    <Box sx={{ px: isMobile ? 2 : 3, py: 3 }}>
                        <Typography
                            sx={{
                                fontSize: 16,
                                fontWeight: 600,
                                color: "#111b21",
                                mb: 3,
                                letterSpacing: 0.5,
                            }}
                        >
                            Media, links and docs
                        </Typography>

                        <Box sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: isMobile ? 4 : 2,
                            justifyContent: "center",
                            overflowX: "auto",
                            left: 10

                        }}>
                            {[
                                { icon: <PhotoIcon sx={{ color: "#00a884", fontSize: 28 }} />, label: "Photos", count: "12" },
                                { icon: <VideocamIcon sx={{ color: "#00a884", fontSize: 28 }} />, label: "Videos", count: "3" },
                                { icon: <DescriptionIcon sx={{ color: "#00a884", fontSize: 28 }} />, label: "Documents", count: "5" },
                                { icon: <LinkIcon sx={{ color: "#00a884", fontSize: 28 }} />, label: "Links", count: "2" },
                            ].map((item, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        cursor: "pointer",
                                        p: 2,
                                        borderRadius: 3,
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            bgcolor: "rgba(0,168,132,0.1)",
                                            transform: "translateY(-4px)",
                                            boxShadow: "0 8px 20px rgba(0,168,132,0.2)",
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 3,
                                            bgcolor: "linear-gradient(135deg, rgba(0,168,132,0.1) 0%, rgba(37,211,102,0.1) 100%)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mb: 1,
                                            border: "2px solid rgba(0,168,132,0.2)",
                                            transition: "all 0.3s ease",
                                        }}
                                    >
                                        {item.icon}
                                    </Box>
                                    <Typography sx={{
                                        fontSize: 13,
                                        color: "#54656f",
                                        textAlign: "center",
                                        fontWeight: 500,
                                        mb: 0.5
                                    }}>
                                        {item.label}
                                    </Typography>
                                    <Typography sx={{
                                        fontSize: 12,
                                        color: "#667781",
                                        fontWeight: 600,
                                        bgcolor: "rgba(0,0,0,0.05)",
                                        px: 1.5,
                                        py: 0.5,
                                        borderRadius: 2,
                                        minWidth: 24,
                                        textAlign: "center"
                                    }}>
                                        {item.count}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Box>

                {/* About/Description Section */}
                <Box sx={{ bgcolor: "white", mt: 1 }}>
                    <Box sx={{ px: 3, py: 2 }}>
                        <Typography
                            sx={{
                                fontSize: 14,
                                fontWeight: 500,
                                color: "#111b21",
                                mb: 1
                            }}
                        >
                            {isGroup ? "Group description" : "About"}
                        </Typography>
                        <Typography
                            sx={{
                                fontSize: 14,
                                color: "#54656f",
                                lineHeight: 1.4
                            }}
                        >
                            {isGroup
                                ? "Welcome to our group! Feel free to share and discuss."
                                : otherUser?.about || "Hey there! I am using WhatsApp."}
                        </Typography>
                    </Box>
                </Box>

                {/* Participants Section (Group Only) */}
                {isGroup && (
                    <Box sx={{ bgcolor: "white", mt: 1 }}>
                        <Box sx={{ px: 3, py: 2 }}>
                            <Typography
                                sx={{
                                    fontSize: 14,
                                    fontWeight: 500,
                                    color: "#111b21",
                                    mb: 2
                                }}
                            >
                                {selectedChat.participants.length} participants
                            </Typography>

                            <List dense sx={{ p: 0 }}>
                                {selectedChat.participants.map((participant) => (
                                    <ListItemButton
                                        key={participant._id}
                                        sx={{
                                            px: 0,
                                            py: 1.5,
                                            borderRadius: 2,
                                            "&:hover": {
                                                bgcolor: "#f0f2f5",
                                            }
                                        }}
                                    >
                                        <ListItemAvatar sx={{ minWidth: 48 }}>
                                            <Avatar
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    bgcolor: participant.profilePicture
                                                        ? "#e9edef"
                                                        : getConsistentColor(participant._id),
                                                    color: participant.profilePicture ? "#54656f" : "#ffffff",
                                                    fontSize: 16
                                                }}
                                                src={participant.profilePicture}
                                            >
                                                {participant.username?.charAt(0).toUpperCase()}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <Typography
                                                        sx={{
                                                            fontSize: 16,
                                                            color: "#111b21",
                                                            fontWeight: 400
                                                        }}
                                                    >
                                                        {participant.username}
                                                    </Typography>
                                                    {adminIdStr === participant._id && (
                                                        <Chip
                                                            label="Group admin"
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: 11,
                                                                bgcolor: "#e9edef",
                                                                color: "#54656f",
                                                                fontWeight: 500
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                participant.phoneNumber && (
                                                    <Typography sx={{ fontSize: 14, color: "#54656f" }}>
                                                        {participant.phoneNumber}
                                                    </Typography>
                                                )
                                            }
                                        />

                                        {adminIdStr === currentUser._id?.toString() &&
                                            participant._id !== currentUser._id && (
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleUserRemove(participant._id)}
                                                    sx={{
                                                        color: "#ef5350",
                                                        "&:hover": {
                                                            bgcolor: "#ffebee",
                                                        }
                                                    }}
                                                >
                                                    <RemoveCircleIcon fontSize="small" />
                                                </IconButton>
                                            )}
                                    </ListItemButton>
                                ))}
                            </List>
                        </Box>
                    </Box>
                )}

                {/* Settings Section */}
                <Box sx={{ bgcolor: "white", mt: 1 }}>
                    <Box sx={{ px: 3, py: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                py: 1.5,
                                cursor: "pointer",
                                borderRadius: 2,
                                "&:hover": {
                                    bgcolor: "#f0f2f5",
                                }
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                <NotificationsIcon sx={{ color: "#54656f" }} />
                                <Typography sx={{ fontSize: 16, color: "#111b21" }}>
                                    Mute notifications
                                </Typography>
                            </Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={muteNotifications}
                                        onChange={(e) => setMuteNotifications(e.target.checked)}
                                        size="small"
                                        sx={{
                                            "& .MuiSwitch-switchBase.Mui-checked": {
                                                color: "#00a884",
                                                "& + .MuiSwitch-track": {
                                                    bgcolor: "#00a884",
                                                },
                                            },
                                        }}
                                    />
                                }
                                label=""
                            />
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                py: 1.5,
                                cursor: "pointer",
                                borderRadius: 2,
                                "&:hover": {
                                    bgcolor: "#f0f2f5",
                                }
                            }}
                        >
                            <StarBorderIcon sx={{ color: "#54656f" }} />
                            <Typography sx={{ fontSize: 16, color: "#111b21" }}>
                                Starred messages
                            </Typography>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                py: 1.5,
                                cursor: "pointer",
                                borderRadius: 2,
                                "&:hover": {
                                    bgcolor: "#f0f2f5",
                                }
                            }}
                        >
                            <LockIcon sx={{ color: "#54656f" }} />
                            <Typography sx={{ fontSize: 16, color: "#111b21" }}>
                                Encryption
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Actions Section */}
                <Box sx={{ bgcolor: "white", mt: 1, mb: 2 }}>
                    <Box sx={{ px: 3, py: 2 }}>
                        {!isGroup && otherUser && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    py: 1.5,
                                    cursor: "pointer",
                                    borderRadius: 2,
                                    "&:hover": {
                                        bgcolor: "#f0f2f5",
                                    }
                                }}
                            >
                                <ContentCopyIcon sx={{ color: "#54656f" }} />
                                <Typography sx={{ fontSize: 16, color: "#111b21" }}>
                                    {otherUser.phoneNumber || "Phone number"}
                                </Typography>
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                py: 1.5,
                                cursor: "pointer",
                                borderRadius: 2,
                                "&:hover": {
                                    bgcolor: "#f0f2f5",
                                }
                            }}
                        >
                            <FavoriteBorderIcon sx={{ color: "#54656f" }} />
                            <Typography sx={{ fontSize: 16, color: "#111b21" }}>
                                Add to favorites
                            </Typography>
                        </Box>

                        {isGroup && adminIdStr !== currentUser._id?.toString() && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    py: 1.5,
                                    cursor: "pointer",
                                    borderRadius: 2,
                                    color: "#ef5350",
                                    "&:hover": {
                                        bgcolor: "#ffebee",
                                    }
                                }}
                                onClick={() => handleUserRemove(currentUser._id)}
                            >
                                <LogoutIcon sx={{ color: "#ef5350" }} />
                                <Typography sx={{ fontSize: 16 }}>
                                    Exit group
                                </Typography>
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                py: 1.5,
                                cursor: "pointer",
                                borderRadius: 2,
                                color: "#ef5350",
                                "&:hover": {
                                    bgcolor: "#ffebee",
                                }
                            }}
                            onClick={handleDeleteChat}
                        >
                            <DeleteIcon sx={{ color: "#ef5350" }} />
                            <Typography sx={{ fontSize: 16 }}>
                                {isGroup ? "Delete group" : "Delete chat"}
                            </Typography>
                        </Box>

                        {!isGroup && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    py: 1.5,
                                    cursor: "pointer",
                                    borderRadius: 2,
                                    color: "#ef5350",
                                    "&:hover": {
                                        bgcolor: "#ffebee",
                                    }
                                }}
                            >
                                <ThumbDownOffAltIcon sx={{ color: "#ef5350" }} />
                                <Typography sx={{ fontSize: 16 }}>
                                    Report contact
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {
                showDetails && (
                    <Adduser onClose={() => setShowDetails(false)} />
                )
            }
        </Box >
    );
};

export default ChatDetailsPanel;
