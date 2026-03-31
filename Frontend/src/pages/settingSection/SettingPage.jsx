import { Avatar, Box, Typography, TextField, IconButton, FormControl, Button, Divider } from '@mui/material'
import { useTheme, useMediaQuery } from "@mui/material";
import SettingItem from './SettingItem';

const SettingPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const userInfo = JSON.parse(localStorage.getItem("user"));


    return (
        <>
            <Box sx={{
                display: "flex",
                width: "100%",
                height: "100vh",
                background: "linear-gradient(135deg, #f0f2f5 0%, #e9ecef 100%)"
            }}>
                <Box sx={{
                    width: isMobile ? "100%" : "40%",
                    minWidth: isMobile ? "100%" : 280,
                    left: isMobile ? 0 : "auto",
                    p: 4,
                    bgcolor: "transparent",
                    overflowY: "auto",
                    "&::-webkit-scrollbar": {
                        width: "6px",
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "transparent",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "rgba(0,168,132,0.3)",
                        borderRadius: "3px",
                        "&:hover": {
                            background: "rgba(0,168,132,0.5)",
                        }
                    },
                }}>
                    {/* Profile Header Card */}
                    <Box sx={{
                        bgcolor: "rgba(255,255,255,0.95)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 4,
                        p: 4,
                        mb: 3,
                        boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
                        textAlign: "center"
                    }}>
                        <Avatar
                            sx={{
                                width: 140,
                                height: 140,
                                m: "auto",
                                mb: 2,
                                fontSize: 56,
                                border: "3px solid #00a884",
                                boxShadow: "0 8px 25px rgba(0,168,132,0.3)",
                                bgcolor: userInfo?.profilePicture ? "transparent" : getConsistentColor(userInfo?._id)
                            }}
                            src={`${userInfo?.profilePicture}`}
                        >
                            {userInfo?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{
                            fontWeight: 700,
                            fontSize: 22,
                            color: "#111b21"
                        }}>
                            {userInfo?.username}
                        </Typography>
                        <Typography sx={{
                            fontSize: 14,
                            color: "#54656f",
                            mt: 1
                        }}>
                            Profile Settings
                        </Typography>
                    </Box>

                    <Box>
                        <SettingItem>

                        </SettingItem>
                    </Box>


                </Box>

                {!isMobile && (<Box
                    sx={{
                        width: "60%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",   // ✅ center horizontally
                            justifyContent: "center",
                        }}
                    >
                        <Avatar
                            src={`${userInfo?.profilePicture}`}

                            sx={{ width: 180, height: 180 }}
                        >
                            {userInfo?.username?.charAt(0).toUpperCase()}
                        </Avatar>

                        <Typography sx={{ mt: 2 }} variant="h6">
                            {userInfo?.username}
                        </Typography>
                    </Box>
                </Box>)}

            </Box >
        </>
    )
}

export default SettingPage