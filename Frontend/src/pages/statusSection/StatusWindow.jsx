import React, { useEffect, useState, useRef } from "react";
import { Box, Typography, IconButton, Avatar, LinearProgress, TextField } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { getConsistentColor } from "../../utils/RandomColor";
import { deleteStatus } from "../../services/status.service";
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import StatusReaction from "./StatusReaction";

const StatusWindow = ({ status, onBack, onStatusUpdate }) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [progress, setProgress] = useState(0);
    const videoRef = useRef(null);
    const duration = 5000;
    const [showViewersList, setShowViewersList] = useState(false);
    const [statusData, setStatusData] = useState(status);
    const [isMouseDown, setIsMouseDown] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const emojiRef = useRef(null);
    const intervalRef = useRef(null);
    // console.log("Rendering StatusWindow with status:", status);

    // Initialize status and mark as viewed
    useEffect(() => {
        setProgress(0);
        setStatusData(status);
        if (!status) return;

        if (status.user._id !== currentUser._id) {
            const token = localStorage.getItem("token");
            fetch(`${import.meta.env.VITE_API_URL}/api/status/${status._id}/view`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}` }
            }).catch(e => console.error(e));
        }
    }, [status?._id, currentUser._id]);

    // Handle timer with pause logic
    useEffect(() => {
        if (!status || status.contentType === "video") return;

        // Pause timer if viewing list, typing, or mouse is held down
        const shouldPause = showViewersList || isTyping || isMouseDown;

        if (shouldPause) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        // Start or resume timer
        if (!intervalRef.current) {
            const intervalTime = 50;
            intervalRef.current = setInterval(() => {
                setProgress(prev => {
                    const next = prev + (intervalTime / duration) * 100;
                    if (next >= 100) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                        onBack();
                        return 100;
                    }
                    return next;
                });
            }, intervalTime);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [status?._id, showViewersList, isMouseDown, isTyping, onBack, duration]);

    useEffect(() => {
        if (!status) return;

        const fetchCurrentStatus = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/api/status`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    const latest = data.data?.find((item) => item._id === status._id);
                    if (latest) {
                        setStatusData(latest);
                        if (typeof onStatusUpdate === "function") {
                            onStatusUpdate(latest);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch status data", error);
            }
        };

        fetchCurrentStatus();
    }, [status?._id]);

    if (!status) {
        return (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", bgcolor: "#f0f2f5" }}>
                <Typography variant="h6" color="text.secondary">Click on a contact to view their status update</Typography>
            </Box>
        );
    }

    const isMine = status?.user?._id === currentUser._id;

    const handleDelete = async () => {
        try {
            await deleteStatus({ statusId: status._id });
            onBack();
        } catch (error) {
            console.error("Failed to delete status", error);
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

    const handleMouseDown = () => {
        setIsMouseDown(true);
    };

    const handleMouseUp = () => {
        setIsMouseDown(false);
    };

    const handleTouchEnd = () => {
        setIsMouseDown(false);
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100vh", bgcolor: "black", color: "white", position: "relative", zIndex: 1000 }}>
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
                <IconButton
                    onClick={onBack}
                    sx={{
                        color: "white",
                        padding: "12px",
                        "&:hover": { bgcolor: "rgba(255,255,255,0.1)" }
                    }}
                >
                    <ArrowBackIcon fontSize="large" />
                </IconButton>
                <Avatar
                    src={status.user?.profilePicture}
                    sx={{
                        ml: 1,
                        mr: 2,
                        bgcolor: status.user?.profilePicture ? "transparent" : getConsistentColor(status.user?._id)
                    }}
                />
                <Typography variant="subtitle1" sx={{ flex: 1, fontWeight: 500, textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}>{status.user?.username || status.user?.name}</Typography>
                {isMine && (
                    <IconButton onClick={handleDelete} sx={{ color: "white", textShadow: "1px 1px 2px rgba(0,0,0,0.8)" }}><DeleteIcon /></IconButton>
                )}
            </Box>

            {/* Content Area */}
            <Box
                sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleMouseDown}
                onTouchEnd={handleTouchEnd}
            >
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
                <Box
                    onClick={(e) => handleClickArea(e, "prev")}
                    onTouchEnd={(e) => handleClickArea(e, "prev")}
                    sx={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: { xs: "40%", sm: "30%" },
                        cursor: "pointer",
                        zIndex: 5
                    }}
                />
                <Box
                    onClick={(e) => handleClickArea(e, "next")}
                    onTouchEnd={(e) => handleClickArea(e, "next")}
                    sx={{
                        position: "absolute",
                        right: 0,
                        top: "10%",
                        bottom: "10%",
                        width: "30%",
                        cursor: "pointer",
                        zIndex: 5
                    }}
                />

            </Box>

            {isMine ? (<Box sx={{
                position: "absolute",
                bottom: 30,
                left: "50%",
                transform: "translateX(-50%)",
                color: "white",
                textShadow: "1px 1px 2px rgba(0,0,0,0.8)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexDirection: "row"
            }} >
                <Typography>{statusData.viewers.length}</Typography>
                <RemoveRedEyeIcon
                    onClick={() => {
                        setShowViewersList(prev => !prev);
                    }}
                />
            </Box>) : (<StatusReaction status={statusData} onTypingChange={setIsTyping} onBack={onBack} onStatusUpdate={(updated) => {
                setStatusData(updated);
                if (typeof onStatusUpdate === "function") {
                    onStatusUpdate(updated);
                }
            }} />

            )}
            {/* Viewers List Modal */}
            {showViewersList && (
                <Box sx={{
                    position: "absolute",
                    bottom: 80,
                    left: "50%",
                    transform: "translateX(-50%)",
                    bgcolor: "rgba(0,0,0,0.8)",
                    color: "white",
                    borderRadius: 2,
                    p: 2,
                    zIndex: 10,
                    maxHeight: "200px",
                    overflowY: "auto",
                    width: "80%",
                }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>Viewed By</Typography>
                    {statusData.viewers.length === 0 ? (
                        <Typography variant="body2">No views yet</Typography>
                    ) : (
                        statusData.viewers.map(viewer => (
                            <Box key={viewer._id} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                                <Avatar
                                    src={viewer.profilePicture}
                                    sx={{
                                        mr: 2,
                                        bgcolor: viewer.profilePicture ? "transparent" : getConsistentColor(viewer._id)
                                    }}
                                />
                                <Typography variant="subtitle1">{viewer.username || viewer.name}</Typography>
                            </Box>
                        ))
                    )}
                </Box>
            )}

        </Box>
    );
};

export default StatusWindow;
