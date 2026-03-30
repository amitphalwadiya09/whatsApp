import React, { useState } from "react";
import { Box, useTheme, useMediaQuery } from "@mui/material";
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
        <Box sx={{ display: "flex", width: "100%", height: "100%" }}>
            <Box sx={{ width: "40%", borderRight: "1px solid #e0e0e0" }}>
                <StatusList onSelect={setSelectedStatus} selectedStatus={selectedStatus} />
            </Box>
            <Box sx={{ width: "60%" }}>
                <StatusWindow status={selectedStatus} onBack={() => setSelectedStatus(null)} />
            </Box>
        </Box>
    );
};

export default StatusPage;