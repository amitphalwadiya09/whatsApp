import React, { useEffect, useRef } from "react";
import { Box, Typography, IconButton, Avatar, Dialog } from "@mui/material";
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { useVideoCall } from "../../context/VideoCallContext";

export const VideoCallUI = () => {
    const { callState, callerData, localStream, remoteStream, answerCall, rejectCall, endCall } = useVideoCall();

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream, callState]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream, callState]);

    if (callState === "idle") return null;

    if (callState === "receiving") {
        return (
            <Dialog open={true} maxWidth="xs" fullWidth PaperProps={{ sx: { bgcolor: "transparent", boxShadow: "none" } }}>
                <Box sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center", bgcolor: "rgba(30,30,30,0.95)", color: "white", borderRadius: 4, backdropFilter: "blur(10px)" }}>
                    <Avatar src={callerData?.from?.profilePicture} sx={{ width: 100, height: 100, mb: 2, border: "3px solid #EDEDED" }} />
                    <Typography variant="h5" sx={{ mb: 1, fontWeight: 500 }}>{callerData?.from?.username || callerData?.from?.name}</Typography>
                    <Typography variant="subtitle1" sx={{ color: "#ababab", mb: 6 }}>Incoming video call...</Typography>
                    
                    <Box sx={{ display: "flex", gap: 6 }}>
                        <IconButton onClick={rejectCall} sx={{ bgcolor: "#f44336", color: "white", width: 64, height: 64, '&:hover': { bgcolor: "#d32f2f" }, boxShadow: "0 4px 12px rgba(244,67,54,0.4)" }}>
                            <CallEndIcon sx={{ fontSize: 32 }} />
                        </IconButton>
                        <IconButton onClick={answerCall} sx={{ bgcolor: "#4caf50", color: "white", width: 64, height: 64, '&:hover': { bgcolor: "#388e3c" }, boxShadow: "0 4px 12px rgba(76,175,80,0.4)" }}>
                            <CallIcon sx={{ fontSize: 32 }} />
                        </IconButton>
                    </Box>
                </Box>
            </Dialog>
        );
    }

    if (callState === "calling" || callState === "active") {
        return (
            <Box sx={{
                position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
                bgcolor: "#000", zIndex: 9999, display: "flex", flexDirection: "column"
            }}>
                {/* Remote Video (Full Screen) */}
                <Box sx={{ flex: 1, position: "relative", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "#111" }}>
                    {callState === "calling" && (
                        <Box sx={{ textAlign: "center", zIndex: 10 }}>
                            <Avatar src={callerData?.from?.profilePicture} sx={{ width: 120, height: 120, mx: "auto", mb: 3 }} />
                            <Typography variant="h4" sx={{ color: "white", mb: 1 }}>Calling...</Typography>
                        </Box>
                    )}
                    <video 
                        ref={remoteVideoRef} 
                        autoPlay 
                        playsInline 
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", display: remoteStream ? "block" : "none" }} 
                    />
                    
                    {/* Local Video (PiP) */}
                    <Box sx={{
                        position: "absolute", bottom: 120, right: 24, width: 120, height: 160,
                        bgcolor: "#333", borderRadius: 3, overflow: "hidden", 
                        border: "2px solid rgba(255,255,255,0.3)",
                        boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                        zIndex: 20
                    }}>
                        <video 
                            ref={localVideoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} 
                        />
                    </Box>
                </Box>
                
                {/* Controls Area */}
                <Box sx={{ p: 4, display: "flex", justifyContent: "center", background: "linear-gradient(transparent, rgba(0,0,0,0.8))", position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 30 }}>
                    <IconButton onClick={endCall} sx={{ bgcolor: "#f44336", color: "white", width: 64, height: 64, '&:hover': { bgcolor: "#d32f2f" }, boxShadow: "0 4px 12px rgba(244,67,54,0.4)" }}>
                        <CallEndIcon sx={{ fontSize: 36 }} />
                    </IconButton>
                </Box>
            </Box>
        );
    }

    return null;
};
