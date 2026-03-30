import express from "express";
import protect from "../middleware/Protect.js";
import {
    createConversation,
    createGroupConversation,
    getUserConversations,
    deleteConversation,
    resetUnreadCount,
    addUserToGroup,
    removeUserFromGroup,
    updateGroup
} from "../Controller/conversation.js";

import { multerMiddleware } from "../Config/cloudinaryconfig.js";

const conversationRouter = express.Router();

// one‑to‑one conversation
conversationRouter.post("/", protect, createConversation);

// group conversation
conversationRouter.post("/creategroup", protect, createGroupConversation);

conversationRouter.get("/", protect, getUserConversations);

conversationRouter.delete("/delete/:id", protect, deleteConversation);

conversationRouter.put("/update-group", protect, multerMiddleware, updateGroup);

conversationRouter.put("/reset-unread", protect, resetUnreadCount);
conversationRouter.put("/add-user", protect, addUserToGroup);

conversationRouter.put("/remove-user", protect, removeUserFromGroup);

export default conversationRouter;