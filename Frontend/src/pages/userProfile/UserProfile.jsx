import { Avatar, Box, Typography, TextField, IconButton, FormControl, Button } from '@mui/material'
import React, { useState } from 'react'
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import axios from 'axios';
import { useTheme, useMediaQuery } from "@mui/material";
import { updateUserProfile } from '../../services/userService';
import { useEffect } from "react";


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
            <Box sx={{ display: "flex", width: "100%", height: "100vh" }}>


                <Box sx={{
                    width: isMobile ? "100%" : "50%",
                    minWidth: isMobile ? "100%" : 280,
                    left: isMobile ? 0 : "auto", p: 4, bgcolor: "rgb(241, 242, 245)"
                }}>

                    {/* Profile Header */}
                    <Box>
                        <Typography variant="h5" sx={{ mb: 5 }}>Profile</Typography>
                        <Avatar

                            sx={{ width: 200, height: 200, mt: 2, m: "auto" }}
                            src={`${userInfo?.profilePicture}`}
                        >

                        </Avatar>
                        <Box>
                            <Box component="form" encType='multipart/form-data' onSubmit={handleImageUpload}
                                sx={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", mt: "50px" }}>

                                <input type='file' onChange={handleImageChange}></input>
                                <Button type='submit' color='success'>Edit</Button>
                            </Box>
                        </Box>
                    </Box>

                    {/* Name Section */}
                    <Box sx={{ mt: 4 }}>
                        <Typography>Name</Typography>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TextField
                                variant="standard"
                                fullWidth
                                value={username}
                                disabled={!editName}
                                onChange={(e) => setUsername(e.target.value)}
                            />

                            <IconButton
                                onClick={() =>
                                    editName ? handleUpdate() : setEditName(true)
                                }
                            >
                                {editName ? <CheckIcon /> : <EditIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                    {/* About Section */}
                    <Box sx={{ mt: 4 }}>
                        <Typography>About</Typography>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <TextField
                                variant="standard"
                                // label={userInfo.about}
                                fullWidth
                                value={about}
                                disabled={!editAbout}
                                onChange={(e) => setAbout(e.target.value)}
                            />

                            <IconButton
                                onClick={() =>
                                    editAbout ? handleUpdate() : setEditAbout(true)
                                }
                            >
                                {editAbout ? <CheckIcon /> : <EditIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                </Box>

                {!isMobile && (<Box
                    sx={{
                        width: "50%",
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

export default UserProfile