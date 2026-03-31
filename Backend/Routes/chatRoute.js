import express from "express";
import { deleteMessage, getConversation, getMessages, groupMessageSeen, markAsRead, sendMessage } from "../Controller/chatController.js";
import { multerMiddleware, uploadFileMiddleware } from "../Config/cloudinaryconfig.js";
import protect from "../middleware/Protect.js";

const chatRouter = express.Router();

chatRouter.post('/send-message', protect, uploadFileMiddleware, sendMessage)
chatRouter.get('/conversations', protect, getConversation)
chatRouter.get('/conversations/:conversationId/messages', protect, getMessages)

chatRouter.put('/messages/read', protect, markAsRead);
chatRouter.delete('/messages/:messageId', protect, deleteMessage)
chatRouter.put('/messages/seen', protect, groupMessageSeen);



export default chatRouter;