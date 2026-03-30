import { Box } from "@mui/material";
import ChatList from "./ChatList";
import ChatWindow from "./Chatwindow";
import { useSelector } from "react-redux";

const ChatPage = ({ isMobile }) => {
    const selectedChat = useSelector((state) => state.chats.selectedChat);

    if (isMobile) {

        return (
            <Box sx={{ width: "100%", height: "100%" }}>
                {!selectedChat && <ChatList />}
                {selectedChat && <ChatWindow />}
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", width: "100%", height: "100%" }}>

            {/* Chat List */}
            <Box
                sx={{
                    width: "40%",
                    borderRight: "1px solid #e0e0e0"
                }}
            >
                <ChatList />
            </Box>

            {/* Chat Window */}
            <Box sx={{ width: "60%" }}>
                <ChatWindow />
            </Box>

        </Box>
    );
};

export default ChatPage;