import React, { useState } from "react";
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Grid,
    Checkbox,
    FormControlLabel,
    IconButton
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import { useNavigate } from "react-router-dom";
import { avatars } from "../../utils/data";
import { updateUserProfile } from "../../services/userService";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../../Slices/authSlice";
import Spinner from "../../utils/Spinner";

const RegisterUserPage = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.auth);

    const [user, setUser] = useState({
        username: "",
        // about: "",
        agreed: false,
        profilePicture: "",
        file: null
    });

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;

        setUser((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleAvatarSelect = (avatar) => {
        setUser((prev) => ({
            ...prev,
            profilePicture: avatar,
            file: null
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];

        if (file) {
            setUser((prev) => ({
                ...prev,
                file,
                profilePicture: URL.createObjectURL(file)
            }));
        }
    };

    const handleRegister = async () => {

        if (!user.username) {
            toast.error("Username required");
            return;
        }

        if (!user.agreed) {
            toast.error("Please accept terms");
            return;
        }

        try {

            dispatch(loginStart());

            const formData = new FormData();

            formData.append("username", user.username);
            formData.append("agreed", user.agreed);

            if (user.file) {
                formData.append("profilePicture", user.file);
            } else if (user.profilePicture) {
                formData.append("profilePicture", user.profilePicture);
            }

            const response = await updateUserProfile(formData);

            if (response.status === "success") {

                toast.success("Profile created");
                const updatedUser = response.data;

                dispatch(loginSuccess({
                    user: updatedUser,
                    token: localStorage.getItem("token")
                }));

                localStorage.setItem("user", JSON.stringify(updatedUser));
                navigate("/home");
            }

        } catch (error) {

            dispatch(loginFailure(error.message));
            toast.error("Something went wrong while adding user");

        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "#F0F2F5",
                display: "flex",
                flexDirection: "column"
            }}
        >
            {/* Header */}
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1 }}>
                <WhatsAppIcon sx={{ color: "#25D366", fontSize: 32 }} />
                <Typography fontWeight={600}>WhatsApp</Typography>
            </Box>

            {/* Center */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    px: 2
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: "100%",
                        maxWidth: 420,
                        p: { xs: 3, sm: 4 },
                        borderRadius: 2,
                        border: "1px solid #E9EDEF"
                    }}
                >

                    <Typography variant="h5" fontWeight={500} mb={1}>
                        Create your profile
                    </Typography>

                    <Typography sx={{ color: "#667781", mb: 3 }}>
                        Set up your WhatsApp profile
                    </Typography>

                    {/* Avatar Preview */}
                    <Box display="flex" justifyContent="center" mb={2}>
                        <Avatar
                            src={user.profilePicture}
                            sx={{ width: 90, height: 90 }}
                        />
                    </Box>

                    {/* Upload Photo */}
                    <Box display="flex" justifyContent="center" mb={2}>
                        <IconButton component="label">
                            <PhotoCamera />
                            <input hidden type="file" onChange={handleFileUpload} />
                        </IconButton>
                    </Box>

                    <Typography fontSize={14} mb={1}>
                        Choose Avatar
                    </Typography>

                    {/* Avatar Grid */}
                    <Grid container spacing={1} mb={3}>
                        {avatars.map((avatar, index) => (
                            <Grid xs={3} key={index}>
                                <Avatar
                                    src={avatar}
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        cursor: "pointer",
                                        border:
                                            user.profilePicture === avatar
                                                ? "2px solid #25D366"
                                                : "2px solid transparent"
                                    }}
                                    onClick={() => handleAvatarSelect(avatar)}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    {/* Username */}
                    <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        value={user.username}
                        onChange={handleChange}
                        sx={{ mb: 2 }}
                    />

                    {/* Agree */}
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="agreed"
                                checked={user.agreed}
                                onChange={handleChange}
                            />
                        }
                        label="I agree to the Terms and Conditions"
                    />

                    {/* Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 2,
                            bgcolor: "#25D366",
                            color: "#000",
                            fontWeight: 600,
                            "&:hover": { bgcolor: "#1EBE5D" }
                        }}
                        onClick={handleRegister}
                    >
                        {loading ? <Spinner size="small" /> : "Continue"}
                    </Button>

                </Paper>
            </Box>

            {/* Footer */}
            <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography sx={{ fontSize: 12, color: "#667781" }}>
                    Your personal messages are end-to-end encrypted
                </Typography>
            </Box>
        </Box>
    );
};

export default RegisterUserPage;