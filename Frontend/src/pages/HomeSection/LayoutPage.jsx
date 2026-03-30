import Box from "@mui/material/Box";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./LeftSidebar";
import { useTheme, useMediaQuery } from "@mui/material";
import { useSelector } from "react-redux";

const LayoutPage = () => {

    const selectedChat = useSelector((state) => state.chats.selectedChat);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Box sx={{ display: "flex", height: "100vh", flexDirection: "row" }}>

            {/* Desktop sidebar */}
            {!isMobile && <LeftSidebar />}

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden"
                }}
            >
                <Outlet />
            </Box>

            {/* Mobile bottom sidebar */}
            {isMobile && !selectedChat && <LeftSidebar isMobile />}

        </Box>
    );
};

export default LayoutPage;