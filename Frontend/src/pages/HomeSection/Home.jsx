import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";
import ChatPage from "../chatSection/ChatPage";

const Home = () => {

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const selectedChat = useSelector((state) => state.chats.selectedChat);

    return (
        <Box sx={{ display: "flex", height: "100%", width: "100%" }}>
            <ChatPage isMobile={isMobile} selectedChat={selectedChat} />
        </Box>
    );
};

export default Home;