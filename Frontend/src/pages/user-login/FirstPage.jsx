import { Box, Button, Typography } from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { useNavigate } from "react-router-dom";

const FirstPage = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#f0f2f5",
            }}
        >
            <WhatsAppIcon sx={{ fontSize: 80, color: "#25D366" }} />
            <Typography variant="h5" mt={2} fontWeight={600}>
                Welcome to WhatsApp
            </Typography>

            <Button
                variant="contained"
                sx={{ mt: 4, bgcolor: "#25D366" }}
                onClick={() => navigate("/user-login")}
            >
                Agree & Continue
            </Button>
        </Box>
    );
};

export default FirstPage;