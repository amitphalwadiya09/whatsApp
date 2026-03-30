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
                    px: 2,
                    py: 1,
                    bgcolor: "rgb(241, 242, 245)",
                    borderBottom: "1px solid #ddd",
                }}
            >
                {selectedChat && (
                    <>
                        <Box
                            sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}

                        >
                            <ArrowBackIosIcon onClick={handleBack} />
                            {/* Avatar */}
                            <Avatar
                                sx={{
                                    bgcolor: selectedChat.isGroupChat ? "#1976d2" : "#25D366",
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
                            <Box onClick={() => setShowDetails(true)}>
                                <Typography sx={{ fontWeight: 500 }}>
                                    {selectedChat.isGroupChat
                                        ? selectedChat.chatName
                                        : (receiver?.username || receiver?.name || "Unknown")}
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: "10px" }}>
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
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <VideocamIcon onClick={handleVideoCall} sx={{ cursor: "pointer", '&:hover': { color: "#25D366" } }} />
                            <PhoneIcon />
                            <MoreVertIcon />
                        </Box>
                    </>
                )}
            </Box>
        </>
    )
}

export default ChatWindowHeader;