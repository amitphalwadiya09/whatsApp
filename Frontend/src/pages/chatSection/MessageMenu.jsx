import React from "react";
import { Popover, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const MessageMenu = ({ anchorEl, handleClose, selectedMsg, onDelete }) => {
    const open = Boolean(anchorEl);

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
            }}
            transformOrigin={{
                vertical: "top",
                horizontal: "right",
            }}
            PaperProps={{
                sx: {
                    borderRadius: 1.5,
                    width: { xs: 140, sm: 160 },
                    bgcolor: "#fff",
                    boxShadow: "none", // remove shadow
                },
            }}
        >
            <List sx={{ p: 0 }}>
                {/* Copy */}
                <ListItemButton
                    sx={{ py: 0.5, px: 1.5, minHeight: 30 }}
                    onClick={() => {
                        navigator.clipboard.writeText(selectedMsg?.content || "");
                        handleClose();
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                        <ContentCopyIcon fontSize="small" sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={<Typography variant="body2" sx={{ fontSize: 12 }}>Copy</Typography>}
                    />
                </ListItemButton>

                {/* Delete */}
                {selectedMsg &&
                    (typeof selectedMsg.sender === "object"
                        ? selectedMsg.sender._id
                        : selectedMsg.sender) === JSON.parse(localStorage.getItem("user"))._id && (
                        <ListItemButton
                            sx={{ py: 0.5, px: 1.5, minHeight: 30 }}
                            onClick={async () => {
                                try {
                                    await onDelete(selectedMsg._id);
                                    handleClose();
                                } catch (err) {
                                    console.log(err);
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 30 }}>
                                <DeleteIcon fontSize="small" sx={{ fontSize: 16, color: "red" }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Typography variant="body2" sx={{ fontSize: 12 }}>Delete</Typography>}
                            />
                        </ListItemButton>
                    )}

                {/* Star */}
                <ListItemButton
                    sx={{ py: 0.5, px: 1.5, minHeight: 30 }}
                    onClick={() => {
                        // console.log("Star clicked!");
                        handleClose();
                    }}
                >
                    <ListItemIcon sx={{ minWidth: 30 }}>
                        <StarBorderIcon fontSize="small" sx={{ fontSize: 16, color: "#fbc02d" }} />
                    </ListItemIcon>
                    <ListItemText
                        primary={<Typography variant="body2" sx={{ fontSize: 12 }}>Star</Typography>}
                    />
                </ListItemButton>
            </List>
        </Popover>
    );
};

export default MessageMenu;