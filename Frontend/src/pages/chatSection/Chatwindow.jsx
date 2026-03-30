import React, { useState } from "react";
import { Box } from "@mui/material";
import { useSelector } from "react-redux";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowChat from "./ChatWindowChat";
import ChatWindowTyping from "./ChatWindowTyping";
import WithChatWindow from "./WithChatWindow";
import ChatDetailsPanel from "./ChatDetailsPanel";

const Chatwindow = () => {
    const selectedChat = useSelector((state) => state.chats.selectedChat);
    const [showDetails, setShowDetails] = useState(false);
    return (
        <><Box>
            {selectedChat ? (<Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    bgcolor: "#ece5dd",
                    position: "relative"
                }}
            >
                <ChatWindowHeader showDetails={showDetails} setShowDetails={setShowDetails} />
                <ChatWindowChat />
                <ChatWindowTyping />
            </Box>) : (<WithChatWindow></WithChatWindow>)}
            {showDetails && (
                <ChatDetailsPanel onClose={() => setShowDetails(false)} />
            )}
        </Box>
        </>
    )
}

export default Chatwindow