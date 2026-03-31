import React, { useState } from "react";
import { Box, useTheme, useMediaQuery, Typography } from "@mui/material";
import StatusList from "./StatusList";
import StatusWindow from "./StatusWindow";

const StatusPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const [selectedStatus, setSelectedStatus] = useState(null);

    if (isMobile) {
        return (
            <Box sx={{ width: "100%", height: "100%" }}>
                {!selectedStatus && <StatusList onSelect={setSelectedStatus} />}
                {selectedStatus && <StatusWindow status={selectedStatus} onBack={() => setSelectedStatus(null)} />}
            </Box>
        );
    }

    return (
        <Box sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #f0f2f5 0%, #e9ecef 100%)"
        }}>
            <Box sx={{
                width: "40%",
                borderRight: "1px solid rgba(0,0,0,0.08)",
                bgcolor: "transparent"
            }}>
                <StatusList onSelect={setSelectedStatus} selectedStatus={selectedStatus} />
            </Box>
            <Box sx={{
                width: "60%",
                bgcolor: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
            }}>
                {selectedStatus ? (
                    <StatusWindow status={selectedStatus} onBack={() => setSelectedStatus(null)} />
                ) : (
                    <Typography sx={{
                        color: "#54656f",
                        fontSize: 18,
                        fontWeight: 500
                    }}>
                        Select a status to view
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default StatusPage;