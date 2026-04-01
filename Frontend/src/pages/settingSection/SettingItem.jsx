import React, { useState } from "react";
import { Box, Avatar, Typography, Divider } from "@mui/material";
import { Dialog, DialogTitle, DialogContent, TextField, Button, DialogActions } from "@mui/material";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import LockIcon from "@mui/icons-material/Lock";
import ChatIcon from "@mui/icons-material/Chat";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StorageIcon from "@mui/icons-material/Storage";
import HelpIcon from "@mui/icons-material/Help";
import GroupIcon from "@mui/icons-material/Group";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import { deleteAccount, updateUserNumber } from "../../services/userService";
import { toast } from "react-toastify";

const SettingItem = () => {

    const [showNumberAdd, setShowNumberAdd] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState("");
    const userInfo = JSON.parse(localStorage.getItem("user"));
    const phoneRegex = /^[0-9\s]{10,10}$/;
    const itemStyle = {
        display: "flex",
        alignItems: "center",


        p: 2,
        cursor: "pointer",
        "&:hover": {
            bgcolor: "#eaeaea",
        },
    };

    const avatarStyle = {
        bgcolor: "#dfe5e7",
        color: "#000",
        mr: 2,
    };

    const settings = [

        {
            title: "Privacy",
            subtitle: "Block contacts, disappearing messages",
            icon: <LockIcon />,
        },
        {
            title: "Avatar",
            subtitle: "Create, edit, profile photo",
            icon: <GroupIcon />,
        },
        {
            title: "Chats",
            subtitle: "Theme, wallpapers, chat history",
            icon: <ChatIcon />,
        },
        {
            title: "Notifications",
            subtitle: "Message, group & call tones",
            icon: <NotificationsIcon />,
        },
        {
            title: "Storage and data",
            subtitle: "Network usage, auto-download",
            icon: <StorageIcon />,
        },
        {
            title: "Help",
            subtitle: "Help center, contact us",
            icon: <HelpIcon />,
        },
    ];

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const hadleDeleteUser = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteAccount();

            if (res.status === "success") {
                toast.success("Account deleted successfully");
                setTimeout(() => {
                    localStorage.clear();
                    window.location.href = "/";
                }, 1000);
            } else {
                toast.error(res.message || "Failed to delete account");
            }
        } catch (error) {
            console.log(error);
            toast.error("Error deleting account");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    }

    const handleUpdateNumber = async () => {
        try {
            if (!phoneNumber) {
                toast.error("Enter phone number");
                return;
            }

            if (!phoneRegex.test(phoneNumber.trim())) {
                toast.error("Invalid phone number");
                return;
            }

            const response = await updateUserNumber(phoneNumber);

            if (response.status === "success") {
                const updatedUser = response.data;

                localStorage.setItem("user", JSON.stringify(updatedUser));

                toast.success("Number Updated");
                setShowNumberAdd(false);
            }
        } catch (error) {
            console.log(error);
            toast.error("Update failed");
        }
    };


    // console.log(userInfo.phoneNumber)
    const handleAddNumber = () => {
        setShowNumberAdd(true);
    };
    return (
        <Box >
            <Box sx={itemStyle} onClick={handleAddNumber}>
                <Avatar sx={avatarStyle}>
                    <VpnKeyIcon />
                </Avatar>

                <Box>
                    <Typography>Account</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Security notifications, change number
                    </Typography>
                </Box>
            </Box>
            <Divider />

            {/* 🔹 Normal Settings */}
            {settings.map((item, index) => (
                <React.Fragment key={index}>
                    <Box sx={itemStyle}>
                        <Avatar sx={avatarStyle}>
                            {item.icon}
                        </Avatar>

                        <Box>
                            <Typography>{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.subtitle}
                            </Typography>
                        </Box>
                    </Box>
                    <Divider />
                </React.Fragment>
            ))}

            {/* 🔥 Delete Account */}
            <Box
                sx={{
                    ...itemStyle,
                    mb: 3
                }}
                onClick={handleDeleteClick}
            >
                <Avatar
                    sx={{
                        bgcolor: "#ffebee",
                        color: "red",
                        mr: 2,
                    }}
                >
                    <DeleteIcon />
                </Avatar>

                <Box sx={{ mb: 5 }}>
                    <Typography color="error">
                        Delete Account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Permanently delete your account
                    </Typography>
                </Box>
            </Box>
            <Dialog open={showNumberAdd} onClose={() => setShowNumberAdd(false)}>
                <DialogTitle>Your Phone Number</DialogTitle>

                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 300 }}>

                    {/* Current number */}
                    <Typography variant="body2">
                        Your phone number is: <strong>{userInfo?.phoneNumber || "Not set"}</strong>
                    </Typography>

                    {/* Input */}
                    <TextField
                        label="Update number"
                        variant="outlined"
                        fullWidth
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />

                    {/* Buttons */}
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <Button onClick={() => setShowNumberAdd(false)}>Cancel</Button>
                        <Button variant="contained" onClick={handleUpdateNumber}>
                            Update
                        </Button>
                    </Box>

                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                maxWidth="sm"
                fullWidth
            >
                <Box sx={{
                    bgcolor: "#ffebee",
                    display: "flex",
                    justifyContent: "center",
                    pt: 2
                }}>
                    <WarningIcon sx={{ fontSize: 48, color: "#c62828" }} />
                </Box>
                <DialogTitle sx={{ textAlign: "center", fontWeight: 700, color: "#c62828" }}>
                    Delete Account?
                </DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        This action cannot be undone. Your account and all data will be permanently deleted.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        • All your messages will be deleted
                        • Your profile will not be recoverable
                        • Contacts won't be able to reach you
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2, gap: 1 }}>
                    <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        variant="outlined"
                        sx={{
                            borderColor: "#00a884",
                            color: "#00a884",
                            "&:hover": {
                                borderColor: "#25d366",
                                bgcolor: "rgba(0,168,132,0.05)"
                            }
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={hadleDeleteUser}
                        variant="contained"
                        disabled={isDeleting}
                        sx={{
                            bgcolor: "#c62828",
                            "&:hover": {
                                bgcolor: "#b71c1c"
                            },
                            "&:disabled": {
                                bgcolor: "#ccc"
                            }
                        }}
                    >
                        {isDeleting ? "Deleting..." : "Delete Account"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default SettingItem;