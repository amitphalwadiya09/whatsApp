import React, { useState, useEffect } from "react";
import { Box, Typography, List, ListItemButton, ListItemAvatar, Avatar, ListItemText, Divider, CircularProgress } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { getSocket } from "../../services/chat.service";

const StatusList = ({ onSelect, selectedStatus }) => {
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const socket = getSocket();

    const fetchStatuses = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStatuses(data.data || []);
            }
        } catch (error) {
            console.error("Failed to load statuses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatuses();

        const handleNewStatus = (newStatus) => {
            setStatuses((prev) => [newStatus, ...prev]);
        };
        const handleDeleteStatus = (statusId) => {
            setStatuses((prev) => prev.filter(s => s._id !== statusId));
        };

        socket.on("new_status", handleNewStatus);
        socket.on("status_deleted", handleDeleteStatus);

        return () => {
            socket.off("new_status", handleNewStatus);
            socket.off("status_deleted", handleDeleteStatus);
        };
    }, [socket]);

    const handleUploadStatus = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("file", file);
        formData.append("contentType", file.type.startsWith("video") ? "video" : "image");

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/status`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });
            const data = await res.json();
            if (res.ok) {
                setStatuses(prev => [data.data, ...prev]);
            }
        } catch (error) {
            console.error("Upload error", error);
        }
    };

    const myStatuses = statuses.filter(s => s.user?._id === currentUser?._id);
    const otherStatuses = statuses.filter(s => s.user?._id !== currentUser?._id);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "#fff" }}>
            <Box sx={{ p: 2, bgcolor: "#f0f2f5" }}>
                <Typography variant="h6">Status</Typography>
            </Box>
            <List sx={{ flex: 1, overflowY: "auto", p: 0 }}>
                {/* My Status */}
                <ListItemButton onClick={() => myStatuses.length ? onSelect(myStatuses[0]) : document.getElementById("status-upload").click()}>
                    <ListItemAvatar sx={{ position: "relative" }}>
                        <Box sx={{
                            borderRadius: "50%",
                            p: myStatuses.length ? 0.8 : 0,
                            border: myStatuses.length ? "2px solid #bdbdbd" : "none",
                            display: "flex",
                            m: 2
                        }}>
                            <Avatar src={currentUser?.profilePicture} />
                        </Box>
                        {!myStatuses.length && (
                            <Box sx={{ position: "absolute", bottom: 0, right: 0, bgcolor: "#25D366", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid white" }}>
                                <AddIcon sx={{ color: "white", fontSize: 16 }} />
                            </Box>
                        )}
                    </ListItemAvatar>
                    <ListItemText primary="My status" secondary={myStatuses.length ? "Tap to view" : "Tap to add status update"} />
                </ListItemButton>
                <input type="file" id="status-upload" hidden accept="image/*,video/*" onChange={handleUploadStatus} />

                <Divider />

                <Box sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary">Recent updates</Typography>
                </Box>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>
                ) : (
                    otherStatuses.map(status => {
                        // Check if current user viewed this status
                        const isViewed = status.viewers && status.viewers.some(v => v._id === currentUser?._id || v === currentUser?._id);
                        return (
                            <ListItemButton key={status._id} selected={selectedStatus?._id === status._id} onClick={() => onSelect(status)}>
                                <ListItemAvatar>
                                    <Box sx={{
                                        borderRadius: "50%",
                                        p: 0.8,
                                        border: `2px solid ${isViewed ? "#f1f4f2" : "#25D366"}`,
                                        display: "flex",
                                        m: 2,

                                    }}>
                                        <Avatar src={status.user?.profilePicture} />
                                    </Box>
                                    <Divider />
                                </ListItemAvatar>

                                <ListItemText primary={status.user?.username || status.user?.name} secondary={new Date(status.createdAt).toLocaleTimeString()} />

                            </ListItemButton>
                        );
                    })
                )}
            </List>
        </Box>
    );
};

export default StatusList;
