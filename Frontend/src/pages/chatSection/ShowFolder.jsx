import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ContactsIcon from '@mui/icons-material/Contacts';
import FilterListIcon from '@mui/icons-material/FilterList';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import { Box, IconButton, Typography, Button } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Webcam from "react-webcam";
import { useTheme, useMediaQuery } from "@mui/material";
import { sendMessage } from "../../services/message.service";
import { getSocket } from "../../services/chat.service";
import { useSelector } from "react-redux";

const ShowFolder = ({ onClose }) => {
    const webcamRef = useRef(null);
    const [openCamera, setOpenCamera] = useState(false);
    const docRef = useRef(null);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const socket = getSocket();
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const selectedChat = useSelector((state) => state.chats.selectedChat);
    const containerRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target) &&
                !openCamera
            ) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [openCamera]);
    if (!selectedChat || !selectedChat.participants) return;

    const handleDocClick = () => {
        docRef.current.click();
    };

    const handleDocChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !selectedChat) return;

        try {
            const receiver = selectedChat.participants.find(
                (p) => String(p._id) !== String(currentUser._id)
            );

            if (!receiver?._id) return;

            const formData = new FormData();
            formData.append("profilePicture", file);
            formData.append("senderId", currentUser._id);
            formData.append("receiverId", receiver._id);
            formData.append("conversation", selectedChat._id);

            const res = await sendMessage(formData);
            onClose();
            socket.emit("send_message", res.data);

        } catch (error) {
            console.error(error);
        }
    };

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "environment"
    };

    const handleCameraOpen = () => {
        setOpenCamera(true);
    };

    const handleCapture = async () => {
        const imageSrc = webcamRef.current.getScreenshot();

        const blob = await fetch(imageSrc).then(res => res.blob());

        const file = new File([blob], "photo.jpg", { type: "image/jpeg" });

        try {
            const receiver = selectedChat.participants.find(
                (p) => String(p._id) !== String(currentUser._id)
            );

            if (!receiver?._id) return;

            const formData = new FormData();
            formData.append("profilePicture", file);
            formData.append("senderId", currentUser._id);
            formData.append("receiverId", receiver._id);
            formData.append("conversation", selectedChat._id);

            const res = await sendMessage(formData);

            socket.emit("send_message", res.data);
            onClose();
            setOpenCamera(false);

        } catch (error) {
            console.error(error);
        }
    };
    return (
        <>
            <Box
                ref={containerRef}
                sx={{
                    position: "absolute",
                    display: "flex",
                    flexDirection: "column",
                    bottom: 70,
                    left: isMobile ? "90px" : "10%",
                    transform: "translateX(-50%)",
                    p: 1,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    backdropFilter: "blur(6px)",
                    borderRadius: "20px",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                    zIndex: 10,

                    "& .MuiIconButton-root": {
                        justifyContent: "flex-start",
                        gap: 1,
                        width: "100%",
                        borderRadius: "12px",
                        px: 1,
                        "&:hover": {
                            backgroundColor: "#f5f5f5",
                        },
                    },
                }}
            >
                <input
                    type="file"
                    ref={docRef}
                    style={{ display: "none" }}
                    onChange={handleDocChange}
                />
                <IconButton onClick={handleDocClick}>
                    <InsertDriveFileIcon sx={{ color: "rgb(127, 102, 255)", fontSize: 20, pt: .3 }} />
                    <Typography fontSize={12}>Document</Typography>
                </IconButton>

                <IconButton onClick={handleDocClick}>
                    <PhotoLibraryIcon sx={{ color: "rgb(3, 123, 252)", fontSize: 20, pt: .3 }} />
                    <Typography fontSize={12}>Photos & videos</Typography>
                </IconButton>


                {!openCamera && (
                    <IconButton onClick={handleCameraOpen}>
                        <CameraAltIcon sx={{ color: "rgb(255, 61, 125)", fontSize: 20 }} />
                        <Typography fontSize={12}>Camera</Typography>
                    </IconButton>
                )}

                <IconButton onClick={handleDocClick}>
                    <HeadphonesIcon sx={{ color: "rgb(250, 101, 51)", fontSize: 20 }} />
                    <Typography fontSize={12}>Audio</Typography>
                </IconButton>

                <IconButton>
                    <ContactsIcon sx={{ color: "rgb(0, 157, 226)", fontSize: 20 }} />
                    <Typography fontSize={12}>Contact</Typography>
                </IconButton>

                <IconButton>
                    <FilterListIcon sx={{ color: "rgb(255, 185, 56)", fontSize: 20 }} />
                    <Typography fontSize={12}>Poll</Typography>
                </IconButton>

                <IconButton>
                    <CalendarTodayIcon sx={{ color: "rgb(255, 46, 116)", fontSize: 20 }} />
                    <Typography fontSize={12}>Event</Typography>
                </IconButton>
            </Box>


            {openCamera && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100vh",
                        bgcolor: "rgba(0,0,0,0.9)",
                        zIndex: 999,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    {/* 🔹 Camera Preview (80%) */}
                    <Box
                        sx={{
                            width: "100%",
                            height: "80%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            overflow: "hidden",
                        }}
                    >
                        <Webcam
                            audio={false}
                            ref={webcamRef}
                            screenshotFormat="image/jpeg"
                            videoConstraints={videoConstraints}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    </Box>

                    {/* 🔹 Bottom Controls */}
                    <Box
                        sx={{
                            height: "20%",
                            display: "flex",
                            justifyContent: "space-around",
                            alignItems: "center",
                            px: 3,
                        }}
                    >
                        {/* ❌ Cancel */}
                        <Button
                            variant="outlined"
                            sx={{
                                color: "#fff",
                                borderColor: "#fff",
                            }}
                            onClick={() => setOpenCamera(false)}
                        >
                            Cancel
                        </Button>

                        {/* 📸 Capture Button (circle style) */}
                        <Box
                            onClick={handleCapture}
                            sx={{
                                width: 70,
                                height: 70,
                                borderRadius: "50%",
                                bgcolor: "#fff",
                                cursor: "pointer",
                                border: "5px solid rgba(255,255,255,0.5)",
                            }}
                        />

                        {/* Empty space (for symmetry like WhatsApp) */}
                        <Box sx={{ width: 80 }} />
                    </Box>
                </Box>
            )}

        </>


    )
}

export default ShowFolder