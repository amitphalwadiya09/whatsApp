import { Box, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import React, { useState } from "react";
import CreateGroup from "../GroupSection/CreateGroup";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
const ChatHeader = () => {

    const [showCreateGroup, setShowCreateGroup] = useState(false);

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    px: 3,
                    py: 2,
                    bgcolor: "#f0f2f5",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #e9edef",
                    minHeight: "64px"
                }}
            >
                <Typography
                    sx={{
                        color: "#111b21",
                        fontWeight: "700",
                        fontSize: "28px",
                        letterSpacing: "-0.5px"
                    }}
                >
                    WhatsApp
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                            "&:hover": {
                                bgcolor: "#e9edef"
                            }
                        }}
                    >
                        <ChatBubbleOutlineIcon sx={{ color: "#54656f", fontSize: "22px" }} />
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            transition: "background-color 0.15s ease",
                            "&:hover": {
                                bgcolor: "#e9edef"
                            }
                        }}
                        onClick={() => setShowCreateGroup(true)}
                    >
                        <AddCircleIcon sx={{ color: "#068911", fontSize: "24px" }} />
                    </Box>
                </Box>
            </Box>

            {showCreateGroup && (
                <CreateGroup
                    onClose={() => setShowCreateGroup(false)}
                />
            )}
        </>
    );
};

export default ChatHeader;