import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { getSocket } from "../services/chat.service";

const VideoCallContext = createContext();

export const useVideoCall = () => useContext(VideoCallContext);

const rtcConfig = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:global.stun.twilio.com:3478" }
    ]
};

export const VideoCallProvider = ({ children }) => {
    const [callState, setCallState] = useState("idle");
    const [callerData, setCallerData] = useState(null); 
    const [recipientId, setRecipientId] = useState(null); 
    
    const [localStream, setLocalStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);
    
    const peerConnection = useRef(null);
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const getLocalStream = async () => {
        if (localStream) return localStream;
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            return stream;
        } catch (err) {
            console.error("Failed to get local stream", err);
            return null;
        }
    };

    const closeConnection = () => {
        if (peerConnection.current) {
            peerConnection.current.ontrack = null;
            peerConnection.current.onicecandidate = null;
            peerConnection.current.close();
            peerConnection.current = null;
        }
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
        }
        setRemoteStream(null);
        setCallState("idle");
        setCallerData(null);
        setRecipientId(null);
    };

    // Socket listeners
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const handleIncomingCall = ({ offer, from }) => {
            if (callState !== "idle") {
                socket.emit("reject_call", { to: from._id });
                return;
            }
            setCallerData({ offer, from });
            setCallState("receiving");
        };

        const handleCallAnswered = async ({ answer }) => {
            if (peerConnection.current && callState === "calling") {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(answer));
                setCallState("active");
            }
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (peerConnection.current) {
                try {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding received ice candidate", e);
                }
            }
        };

        const handleCallRejected = () => {
            closeConnection();
            alert("Call rejected by user");
        };

        const handleCallEnded = () => {
            closeConnection();
        };

        socket.on("incoming_call", handleIncomingCall);
        socket.on("call_answered", handleCallAnswered);
        socket.on("ice_candidate", handleIceCandidate);
        socket.on("call_rejected", handleCallRejected);
        socket.on("call_ended", handleCallEnded);

        return () => {
            socket.off("incoming_call", handleIncomingCall);
            socket.off("call_answered", handleCallAnswered);
            socket.off("ice_candidate", handleIceCandidate);
            socket.off("call_rejected", handleCallRejected);
            socket.off("call_ended", handleCallEnded);
        };
    }, [callState]);

    const createPeerConnection = (isInitiator, targetId) => {
        const socket = getSocket();
        const pc = new RTCPeerConnection(rtcConfig);

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("ice_candidate", { to: targetId, candidate: event.candidate });
            }
        };

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        if (localStream) {
            localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
        }

        return pc;
    };

    const initiateCall = async (receiver) => {
        const stream = await getLocalStream();
        if (!stream) return alert("Could not access camera/microphone");

        setCallState("calling");
        setRecipientId(receiver._id);

        const pc = createPeerConnection(true, receiver._id);
        peerConnection.current = pc;

        stream.getTracks().forEach(track => {
            const senders = pc.getSenders();
            if(!senders.find(s => s.track === track)) pc.addTrack(track, stream);
        });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const socket = getSocket();
        socket.emit("call_user", { 
            userToCall: receiver._id, 
            offer, 
            from: currentUser 
        });
    };

    const answerCall = async () => {
        if (!callerData) return;
        const stream = await getLocalStream();
        if (!stream) return closeConnection();

        setCallState("active");
        
        const pc = createPeerConnection(false, callerData.from._id);
        peerConnection.current = pc;

        stream.getTracks().forEach(track => {
            const senders = pc.getSenders();
            if(!senders.find(s => s.track === track)) pc.addTrack(track, stream);
        });

        await pc.setRemoteDescription(new RTCSessionDescription(callerData.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        const socket = getSocket();
        socket.emit("answer_call", { to: callerData.from._id, answer });
    };

    const rejectCall = () => {
        if (callerData && callerData.from) {
            const socket = getSocket();
            socket.emit("reject_call", { to: callerData.from._id });
        }
        closeConnection();
    };

    const endCall = () => {
        const socket = getSocket();
        if (callState === "calling" && recipientId) {
            socket.emit("end_call", { to: recipientId });
        } else if (callState === "active") {
            const toId = callerData?.from._id || recipientId;
            if (toId) socket.emit("end_call", { to: toId });
        }
        closeConnection();
    };

    return (
        <VideoCallContext.Provider value={{
            callState,
            callerData,
            localStream,
            remoteStream,
            initiateCall,
            answerCall,
            rejectCall,
            endCall
        }}>
            {children}
        </VideoCallContext.Provider>
    );
};
