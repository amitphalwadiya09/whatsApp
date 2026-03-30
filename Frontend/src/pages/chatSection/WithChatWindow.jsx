import React from 'react'
import { Box, Typography, Button } from "@mui/material";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";

const WithChatWindow = () => {
    return (
        <Box
            sx={{
                flex: 1,
                height: "100vh",
                bgcolor: "#f0f2f5",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {/* Center Card */}
            <Box
                sx={{
                    width: 420,
                    bgcolor: "#ffffff",
                    borderRadius: "20px",
                    textAlign: "center",
                    p: 5,
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                }}
            >
                {/* Top Illustration Placeholder */}
                <Box
                    sx={{
                        width: 120,
                        height: 120,
                        bgcolor: "#e6f4ea",
                        borderRadius: "16px",
                        mx: "auto",
                        mb: 3,
                    }}
                />

                <Typography variant="h6" fontWeight={600} gutterBottom>
                    Download WhatsApp for Mac
                </Typography>

                <Typography
                    sx={{
                        fontSize: "14px",
                        color: "#667781",
                        mb: 3,
                        lineHeight: 1.6,
                    }}
                >
                    Make calls and get a faster experience when you download
                    the Mac app.
                </Typography>

                <Button
                    variant="contained"
                    href="https://apps.apple.com/"
                    target="_blank"
                    sx={{
                        bgcolor: "#25D366",
                        textTransform: "none",
                        borderRadius: "25px",
                        px: 4,

                        fontWeight: 600,
                        "&:hover": {
                            bgcolor: "#20bd5a",

                        },

                    }}
                    onClick={() => { }}
                >
                    Get from App Store
                </Button>
            </Box>

            {/* Bottom Quick Actions */}
            <Box
                sx={{
                    display: "flex",
                    gap: 5,
                    mt: 6,
                }}
            >
                {[
                    { icon: <DescriptionOutlinedIcon />, label: "Send document" },
                    { icon: <PersonAddAltOutlinedIcon />, label: "Add contact" },
                    { icon: <AutoAwesomeOutlinedIcon />, label: "Ask Meta AI" },
                ].map((item, index) => (
                    <Box key={index} sx={{ textAlign: "center" }}>
                        <Box
                            sx={{
                                width: 90,
                                height: 90,
                                bgcolor: "#ffffff",
                                borderRadius: "16px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 1.5,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                                cursor: "pointer",
                                "&:hover": {
                                    bgcolor: "#f5f5f5",
                                },
                            }}
                        >
                            {item.icon}
                        </Box>
                        <Typography
                            sx={{
                                fontSize: "14px",
                                color: "#667781",
                            }}
                        >
                            {item.label}
                        </Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    )
}

export default WithChatWindow