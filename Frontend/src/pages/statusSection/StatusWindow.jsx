import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, IconButton, Avatar, LinearProgress } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';

const StatusWindow = ({ status, onBack }) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null);
    const duration = 5000;

    useEffect(() => {
        setProgress(0);
        if (!status) return;

        if (status.user._id !== currentUser._id) {
            const token = localStorage.getItem("token");
            fetch(`${import.meta.env.VITE_API_URL}/api/status/${status._id}/view`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.error(e));
        }

        let interval;
        if (status.contentType !== "video") {
            const intervalTime = 50;
            interval = setInterval(() => {
                setProgress(prev => {
                    const next = prev + (intervalTime / duration) * 100;
                    if (next >= 100) {
                        clearInterval(interval);
                        onBack();
                        return 100;
                    }
                    return next;
                });
            }, intervalTime);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [status, onBack, currentUser._id]);

    if (!status) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", bgcolor: "#f0f2f5" }}>
                <Typography variant="h6" color="text.secondary">Click on a contact to view their status update</Typography>
            </Box>
        );
    }

    const isMine = status.user._id === currentUser._id;

    const handleDelete = async () => {
        const token = localStorage.getItem("token");
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/status/${status._id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            onBack();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    };

    const handleVideoProgress = () => {
        if (videoRef.current) {
            setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
        }
    };

    const handleClickArea = (e, direction) => {
        e.stopPropagation();
        onBack(); // For now, any navigation just closes the current status since we don't have the full list
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "black", color: "white", position: "relative" }}>
            {/* Top Progress Bar */}
            <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, p: 1, zIndex: 10 }}>
                <LinearProgress variant="determinate" value={progress} sx={{
                    height: 3,
                    borderRadius: 2,
                    bgcolor: "rgb(30, 170, 97, 0.7)",
                    '& .MuiLinearProgress-bar': { bgcolor: "white" }
                }} />
            </Box>

            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", p: 2, pt: 3, position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, background: "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 100%)" }}>
                <IconButton onClick={onBack} sx={{ color: "white" }}><ArrowBackIcon /></IconButton>
                <Avatar src={status.user?.profilePicture} sx={{ ml: 1, mr: 2 }} />
                <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 500, textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>{status.user?.username || status.user?.name}</Typography>
                {isMine && (
                    <IconButton onClick={handleDelete} sx={{ color: "white", textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}><DeleteIcon /></IconButton>
                )}
            </Box>

            {/* Content Area */}
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                {status.contentType === "image" || (!status.contentType && status.content.includes("cloudinary")) ? (
                    <img src={status.content} alt="Status" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
                ) : status.contentType === "video" ? (
                    <video
                        ref={videoRef}
                        src={status.content}
                        controls={false}
                        autoPlay
                        onTimeUpdate={handleVideoProgress}
                        onEnded={onBack}
                        style={{ maxWidth: "100%", maxHeight: "100%" }}
                    />
                ) : (
                    <Typography variant="h4" sx={{ textAlign: "center", px: 4 }}>{status.content}</Typography>
                )}

                {/* Left/Right Click Zones */}
                <Box onClick={(e) => handleClickArea(e, "prev")} sx={{ position: "absolute", left: 0, top: "10%", bottom: "10%", width: "30%", cursor: "pointer" }} />
                <Box onClick={(e) => handleClickArea(e, "next")} sx={{ position: "absolute", right: 0, top: "10%", bottom: "10%", width: "30%", cursor: "pointer" }} />
            </Box>
        </Box>
    );
};

export default StatusWindow;
