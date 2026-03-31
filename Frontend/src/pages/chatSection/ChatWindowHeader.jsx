import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import VideocamIcon from '@mui/icons-material/Videocam';
import PhoneIcon from '@mui/icons-material/Phone';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useDispatch } from "react-redux";
import { selectChat } from "../../Slices/chatSlice";
import { useVideoCall } from "../../context/VideoCallContext";
import { getConsistentColor } from "../../utils/RandomColor";

const ChatWindowHeader = ({ showDetails, setShowDetails }) => {
    const selectedChat = useSelector((state) => state.chats.selectedChat);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const onlineUsers = useSelector((state) => state.users.onlineUsers);
    const dispatch = useDispatch();
    const { initiateCall } = useVideoCall();

    const receiver = selectedChat?.participants?.find(
        (p) => p?._id && String(p._id) !== String(currentUser?._id)
    );

    const isUserOnline = receiver
        ? onlineUsers.includes(String(receiver._id))
        : false;

    const handleBack = () => {
        dispatch(selectChat(null));
    };
    // console.log(selectedChat)
    const handleVideoCall = () => {
        if (receiver) {
            initiateCall(receiver);
        }
    };

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    px: 3,
                    py: 2,
                    background: "linear-gradient(135deg, rgba(248,250,252,0.95) 0%, rgba(241,245,249,0.95) 100%)",
                    backdropFilter: "blur(10px)",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    transition: "all 0.3s ease"
                }}
            >
                {selectedChat && (
                    <>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                cursor: "pointer",
                                gap: 2
                            }}
                        >
                            <ArrowBackIosIcon
                                onClick={handleBack}
                                sx={{
                                    fontSize: 20,
                                    color: "#54656f",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        color: "#00a884"
                                    }
                                }}
                            />
                            {/* Avatar */}
                            <Avatar
                                sx={{
                                    bgcolor: selectedChat.isGroupChat
                                        ? (!selectedChat.groupPic ? getConsistentColor(selectedChat._id) : "transparent")
                                        : (!receiver?.profilePicture ? getConsistentColor(receiver?._id) : "transparent"),
                                    mr: 2,
                                    width: 45,
                                    height: 45,
                                }}
                                src={selectedChat.isGroupChat ? selectedChat.groupPic : receiver?.profilePicture}
                                onClick={() => setShowDetails(true)}
                            >
                                {selectedChat.isGroupChat
                                    ? selectedChat.chatName?.charAt(0)
                                    : (receiver?.username || receiver?.name || "?")?.charAt(0)}
                            </Avatar>

                            {/* Name + Status */}
                            <Box
                                onClick={() => setShowDetails(true)}
                                sx={{
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        opacity: 0.7
                                    }
                                }}
                            >
                                <Typography sx={{
                                    fontWeight: 600,
                                    fontSize: 16,
                                    color: "#111b21",
                                    lineHeight: 1.3
                                }}>
                                    {selectedChat.isGroupChat
                                        ? selectedChat.chatName
                                        : (receiver?.username || receiver?.name || "Unknown")}
                                </Typography>
                                <Typography variant="body2" sx={{
                                    fontSize: "12px",
                                    color: isUserOnline && !selectedChat.isGroupChat ? "#00a884" : "#54656f",
                                    fontWeight: isUserOnline && !selectedChat.isGroupChat ? 500 : 400,
                                    lineHeight: 1.2
                                }}>
                                    {selectedChat.isGroupChat
                                        ? `${selectedChat.participants.length} members`
                                        : isUserOnline
                                            ? "Online" :
                                            // : receiver?.lastSeen
                                            // ? `Last seen ${ new Date(receiver.lastSeen).toLocaleString() }`
                                            "Offline"}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Right Icons */}
                        <Box sx={{
                            display: "flex",
                            gap: 3,
                            alignItems: "center"
                        }}>
                            <VideocamIcon
                                onClick={handleVideoCall}
                                sx={{
                                    cursor: "pointer",
                                    color: "#54656f",
                                    fontSize: 24,
                                    transition: "all 0.2s ease",
                                    '&:hover': {
                                        color: "#00a884",
                                        transform: "scale(1.1)"
                                    }
                                }}
                            />
                            <PhoneIcon
                                sx={{
                                    cursor: "pointer",
                                    color: "#54656f",
                                    fontSize: 24,
                                    transition: "all 0.2s ease",
                                    '&:hover': {
                                        color: "#00a884",
                                        transform: "scale(1.1)"
                                    }
                                }}
                            />
                            <MoreVertIcon
                                sx={{
                                    cursor: "pointer",
                                    color: "#54656f",
                                    fontSize: 24,
                                    transition: "all 0.2s ease",
                                    '&:hover': {
                                        color: "#00a884",
                                        transform: "scale(1.1)"
                                    }
                                }}
                            />
                        </Box>
                    </>
                )}
            </Box>
        </>
    )
}

export default ChatWindowHeader;