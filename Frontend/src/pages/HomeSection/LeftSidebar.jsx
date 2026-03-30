import Box from '@mui/material/Box';
import SettingsIcon from '@mui/icons-material/Settings';
import Divider from '@mui/material/Divider';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { Avatar } from "@mui/material";
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Lottie from "lottie-react";
import Chatbot from "../../assets/Chatbot.json";




const LeftSidebar = ({ isMobile }) => {
    const navigate = useNavigate();
    const userInfo = JSON.parse(localStorage.getItem("user"));

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.clear();
        navigate('/welcome');
    };
    return (
        <Box
            sx={{
                width: isMobile ? "100%" : 72,
                height: isMobile ? 60 : "100%",
                position: isMobile ? "fixed" : "relative",
                bottom: isMobile ? 0 : "auto",
                bgcolor: "#ecf9f9",
                display: "flex",
                alignItems: "center",
                justifyContent: isMobile ? "space-evenly" : "space-between",
                flexDirection: isMobile ? "row" : "column",
                zIndex: 10,
                borderRight: !isMobile ? "1px solid #e9edef" : "1px solid #e9edef",
                boxShadow: isMobile ? "0 -1px 2px rgba(0, 0, 0, 0.1)" : "none"
            }}
        >
            {/* upper leftbar */}
            <Box sx={{
                display: "flex",
                width: "100%",
                flexDirection: isMobile ? "row" : "column",
                justifyContent: isMobile ? "space-evenly" : "space-between",
                alignItems: "center",
                px: isMobile ? 0 : 2,
                py: isMobile ? 0 : 3,
                gap: isMobile ? 0 : 2.5
            }}>
                {/* WhatsApp Icon */}
                <Box
                    onClick={() => navigate('/home')}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                            bgcolor: "#e9edef"
                        },
                        "&:active": {
                            bgcolor: "#ddd"
                        }
                    }}
                >
                    <WhatsAppIcon sx={{ fontSize: "26px", color: "#06cf9c" }} />
                </Box>

                {/* Status Icon */}
                <Box
                    onClick={() => navigate('/status')}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                            bgcolor: "#e9edef"
                        },
                        "&:active": {
                            bgcolor: "#ddd"
                        }
                    }}
                >
                    <PanoramaFishEyeIcon sx={{ fontSize: "24px", color: "#54656f" }} />
                </Box>

                {/* Divider for desktop */}
                {!isMobile && (
                    <Divider sx={{
                        width: "32px",
                        bgcolor: "#e9edef",
                        my: 1
                    }} />
                )}

                {/* Chatbot Animation */}
                <Box
                    onClick={() => navigate('/home')}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                            bgcolor: "#e9edef"
                        },
                        "&:active": {
                            bgcolor: "#ddd"
                        }
                    }}
                >
                    <Lottie
                        animationData={Chatbot}
                        loop
                        autoplay
                        style={{ height: 25, width: 35 }}
                    />
                </Box>
            </Box>

            {/* lower leftbar */}
            <Box sx={{
                display: "flex",
                width: "100%",
                flexDirection: isMobile ? "row" : "column",
                justifyContent: isMobile ? "space-evenly" : "space-between",
                alignItems: "center",
                px: isMobile ? 0 : 2,
                py: isMobile ? 0 : 3,
                gap: isMobile ? 0 : 2.5
            }}>
                {/* Settings Icon */}
                <Box
                    onClick={() => navigate('/setting')}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                            bgcolor: "#e9edef"
                        },
                        "&:active": {
                            bgcolor: "#ddd"
                        }
                    }}
                >
                    <SettingsIcon sx={{ fontSize: "24px", color: "#54656f" }} />
                </Box>

                {/* User Profile Avatar */}
                <Avatar
                    src={userInfo?.profilePicture}
                    sx={{
                        width: 35,
                        height: 35,
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                            transform: "scale(1.05)",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)"
                        },
                        border: "2px solid transparent",
                        bgcolor: "#b0ddf5"
                    }}
                    onClick={() => navigate('/user-profile')}
                />

                {/* Logout Icon */}
                <Box
                    onClick={handleLogout}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        "&:hover": {
                            bgcolor: "#e9edef"
                        },
                        "&:active": {
                            bgcolor: "#ddd"
                        }
                    }}
                >
                    <LogoutIcon sx={{ fontSize: "24px", color: "#54656f" }} />
                </Box>
            </Box>
        </Box>
    );
};

export default LeftSidebar;