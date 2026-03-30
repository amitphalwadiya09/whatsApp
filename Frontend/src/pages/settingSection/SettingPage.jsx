import { Avatar, Box, Typography, TextField, IconButton, FormControl, Button, Divider } from '@mui/material'
import { useTheme, useMediaQuery } from "@mui/material";
import SettingItem from './SettingItem';

const SettingPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const userInfo = JSON.parse(localStorage.getItem("user"));


    return (
        <>
            <Box sx={{ display: "flex", width: "100%", height: "100vh" }}>


                <Box sx={{
                    width: isMobile ? "100%" : "40%",
                    minWidth: isMobile ? "100%" : 280,
                    left: isMobile ? 0 : "auto", p: 4, bgcolor: "rgb(241, 242, 245)",
                    overflowY: "auto"
                }}>

                    {/* Profile Header */}
                    <Box sx={{ display: "flex", gap: 2, flexDirection: "column", textAlign: "center", justifyContent: "center" }}>
                        <Avatar

                            sx={{ width: 120, height: 120, mt: 2, m: "auto" }}
                            src={`${userInfo?.profilePicture}`}
                        >
                            {userInfo?.username?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography sx={{ mt: 2 }} variant="h6">
                            {userInfo?.username}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 3 }} />

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