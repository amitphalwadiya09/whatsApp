import { Avatar, Box, Typography, TextField, IconButton, Button } from '@mui/material'
import React, { useState } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';
import { useTheme, useMediaQuery } from "@mui/material";
import { updateUserProfile } from '../../services/userService';
import { useEffect } from "react";
import { getConsistentColor } from "../../utils/RandomColor";


const UserProfile = () => {
    const [userInfo, setUserInfo] = useState(
        JSON.parse(localStorage.getItem("user"))
    );
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    if (!userInfo) {
        return null;
    }
    const [username, setUsername] = useState(userInfo.username || "")
    const [about, setAbout] = useState(userInfo.about || "")
    const agreed = true;
    const [editName, setEditName] = useState(false);
    const [editAbout, setEditAbout] = useState(false);
    const [fileData, setFileData] = useState(null);
    // console.log(userInfo)
    useEffect(() => {
        if (userInfo) {
            setUsername(userInfo.username || "");
            setAbout(userInfo.about || "");
        }
    }, [userInfo]);

    const handleUpdate = async () => {

        try {
            const res = await updateUserProfile({ username, agreed, about });

            // console.log(res);
            if (res.status !== "success") {
                throw new Error(res.message);
            }
            const updatedUser = res.data;

            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUserInfo(updatedUser);
            setEditAbout(false);
            setEditName(false);

        } catch (error) {
            console.log(error.message || error);
        }
    };
    const handleImageChange = (e) => {
        setFileData(e.target.files[0]);
    }

    const handleImageUpload = async (e) => {
        e.preventDefault();

        if (!fileData) return;

        const formdata = new FormData();
        formdata.append("profilePicture", fileData);

        try {
            const res = await updateUserProfile(formdata);

            if (res.status !== "success") {
                throw new Error(res.message);
            }

            const updatedUser = res.data;

            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUserInfo(updatedUser);

            setFileData(null);


        } catch (error) {
            console.log(error.message);
        }
    };

    return (
        <>
            <Box sx={{
                display: "flex",
                width: "100%",
                height: "100vh",
                background: "linear-gradient(135deg, #f0f2f5 0%, #e9ecef 100%)",
                flexDirection: isMobile ? "column" : "row"
            }}>
                <Box sx={{
                    width: isMobile ? "100%" : "50%",
                    p: isMobile ? 3 : 6,
                    bgcolor: "transparent",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
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

                    {/* Top Title */}
                    <Typography sx={{
                        fontWeight: 700,
                        fontSize: isMobile ? 24 : 28,
                        color: "#111b21",
                        mb: 4,
                        letterSpacing: 0.5
                    }}>Profile Settings</Typography>

                    {/* Avatar Upload Section */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "center",
                        mb: 6,
                        position: "relative"
                    }}>
                        <input
                            type='file'
                            onChange={handleImageChange}
                            style={{ display: 'none' }}
                            id="profile-pic-upload"
                        />
                        <label htmlFor="profile-pic-upload" style={{ cursor: 'pointer' }}>
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    bgcolor: userInfo?.profilePicture ? "transparent" : getConsistentColor(userInfo?._id),
                                    fontSize: 60,
                                    border: "3px solid #00a884",
                                    boxShadow: "0 4px 12px rgba(0,168,132,0.2)",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        boxShadow: "0 8px 20px rgba(0,168,132,0.3)",
                                    }
                                }}
                                src={`${userInfo?.profilePicture}`}
                            >
                                {userInfo?.username?.charAt(0).toUpperCase()}
                            </Avatar>
                        </label>
                    </Box>

                    {/* Upload/Save Buttons */}
                    <Box component="form" encType='multipart/form-data' onSubmit={handleImageUpload}
                        sx={{
                            display: "flex",
                            gap: 2,
                            justifyContent: "center",
                            alignItems: "center",
                            mb: 6
                        }}>
                        <Button
                            variant="contained"
                            component="label"
                            sx={{
                                bgcolor: "#00a884",
                                color: "white",
                                borderRadius: 20,
                                px: 3,
                                py: 1,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 14,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    bgcolor: "#25d366",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 12px rgba(0,168,132,0.3)"
                                }
                            }}
                        >
                            Change Photo
                            <input type='file' onChange={handleImageChange} hidden />
                        </Button>
                        <Button
                            type='submit'
                            variant="outlined"
                            sx={{
                                borderColor: "#00a884",
                                color: "#00a884",
                                borderRadius: 20,
                                px: 3,
                                py: 1,
                                textTransform: "none",
                                fontWeight: 600,
                                fontSize: 14,
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    borderColor: "#25d366",
                                    color: "#25d366",
                                    bgcolor: "rgba(0,168,132,0.05)"
                                }
                            }}
                        >
                            Upload
                        </Button>
                    </Box>

                    {/* Divider */}
                    {/* <Box sx={{
                        height: .2,
                        background: "rgba(0,168,132,0.1)",
                        mb: 2
                    }} /> */}

                    {/* Name Section */}
                    <Box sx={{ mb: 6 }}>
                        <Typography sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#54656f",
                            mb: 1.5,
                            textTransform: "uppercase",
                            letterSpacing: 0.5
                        }}>Name</Typography>

                        <Box sx={{ display: "flex", alignItems: "end", gap: 1.5 }}>
                            <TextField
                                variant="standard"
                                fullWidth
                                value={username}
                                disabled={!editName}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: "rgba(0,168,132,0.2)"
                                    },
                                    "& .MuiInput-underline:hover:before": {
                                        borderBottomColor: "#00a884"
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottomColor: "#00a884"
                                    },
                                    "& .MuiInputBase-input": {
                                        fontSize: 16,
                                        fontWeight: 500,
                                        color: "#111b21"
                                    }
                                }}
                            />
                            <IconButton
                                onClick={() =>
                                    editName ? handleUpdate() : setEditName(true)
                                }
                                size="small"
                                sx={{
                                    color: "#00a884",
                                    mb: 1,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        transform: "scale(1.1)"
                                    }
                                }}
                            >
                                {editName ? <CheckIcon /> : <EditIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                    {/* About Section */}
                    <Box>
                        <Typography sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: "#54656f",
                            mb: 1.5,
                            textTransform: "uppercase",
                            letterSpacing: 0.5
                        }}>About</Typography>

                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                            <TextField
                                variant="standard"
                                fullWidth
                                multiline
                                rows={2}
                                value={about}
                                disabled={!editAbout}
                                onChange={(e) => setAbout(e.target.value)}
                                sx={{
                                    "& .MuiInput-underline:before": {
                                        borderBottomColor: "rgba(0,168,132,0.2)"
                                    },
                                    "& .MuiInput-underline:hover:before": {
                                        borderBottomColor: "#00a884"
                                    },
                                    "& .MuiInput-underline:after": {
                                        borderBottomColor: "#00a884"
                                    },
                                    "& .MuiInputBase-input": {
                                        fontSize: 16,
                                        color: "#111b21",
                                        lineHeight: 1.4
                                    }
                                }}
                            />
                            <IconButton
                                onClick={() =>
                                    editAbout ? handleUpdate() : setEditAbout(true)
                                }
                                size="small"
                                sx={{
                                    color: "#00a884",
                                    mt: 0.5,
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                        transform: "scale(1.1)"
                                    }
                                }}
                            >
                                {editAbout ? <CheckIcon /> : <EditIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                </Box>

                {!isMobile && (
                    <Box
                        sx={{
                            width: "50%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            p: 4,
                            position: "relative"
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center"
                            }}
                        >
                            <Avatar
                                src={`${userInfo?.profilePicture}`}
                                sx={{
                                    width: 180,
                                    height: 180,
                                    bgcolor: userInfo?.profilePicture ? "transparent" : getConsistentColor(userInfo?._id),
                                    fontSize: 80,
                                    mb: 3,
                                    border: "3px solid #00a884",
                                    boxShadow: "0 8px 24px rgba(0,168,132,0.2)"
                                }}
                            >
                                {userInfo?.username?.charAt(0).toUpperCase()}
                            </Avatar>

                            <Typography sx={{
                                fontWeight: 700,
                                fontSize: 26,
                                color: "#111b21",
                                mb: 1.5
                            }}>
                                {userInfo?.username}
                            </Typography>
                            <Typography sx={{
                                fontSize: 15,
                                color: "#54656f",
                                maxWidth: 220,
                                lineHeight: 1.5
                            }}>
                                {userInfo?.about || "Hey there! I'm using WhatsApp."}
                            </Typography>
                        </Box>
                    </Box>
                )}

            </Box>
        </>
    )
}

export default UserProfile