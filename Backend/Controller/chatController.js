import { uploadFileToCloudinary } from "../Config/cloudinaryconfig.js";
import Conversation from "../Models/Conversation.model.js";
import Message from "../Models/Message.model.js";
import User from "../Models/User.Model.js";
import response from "../Utils/responseHandler.js";


// SEND MESSAGE (Optimized)
export const sendMessage = async (req, res) => {
    try {
        const { senderId, receiverId, content } = req.body;
        const file = req.file;

        if (!senderId || !receiverId) {
            return response(res, 400, "senderId and receiverId required");
        }

        const participants = [senderId, receiverId].sort();

        let conversation = await Conversation.findOne({
            participants: { $all: participants, $size: 2 },
            isGroupChat: false
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants,
                unreadCount: 1,
                isGroupChat: false
            });
        }

        let imageOrVideoUrl = null;
        let contentType = null;

        if (file) {
            const uploadFile = await uploadFileToCloudinary(file);

            if (!uploadFile?.secure_url) {
                return response(res, 400, "failed to upload file");
            }

            imageOrVideoUrl = uploadFile.secure_url;
            contentType = file.mimetype.startsWith("image") ? "image" :
                file.mimetype.startsWith("video") ? "video" : "file";
        } else if (content?.trim()) {
            contentType = "text";
        } else {
            return response(res, 400, "message content required");
        }

        // Fast query to check receiver status
        const receiverStatus = await User.findById(receiverId).select("isOnline").lean();
        const initialMessageStatus = receiverStatus?.isOnline ? "delivered" : "sent";

        // Create message
        const message = await Message.create({
            conversation: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content,
            contentType,
            imageOrVideoUrl,
            messageStatus: initialMessageStatus
        });

        // Update conversation last message
        await Conversation.findByIdAndUpdate(
            conversation._id,
            {
                lastMessage: message._id,
                unreadCount: receiverId === senderId ? 0 : 1
            }
        );

        // Prepare compact response
        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "username profilePicture isOnline")
            .populate("receiver", "username profilePicture isOnline");

        // Emit via Socket.IO
        if (req.io && req.socketUserMap) {
            // Emit to receiver
            const receiverSocketId = req.socketUserMap.get(receiverId.toString());
            if (receiverSocketId) {
                req.io.to(receiverSocketId).emit("receive_message", populatedMessage);

                // Emit status update
                req.io.to(receiverSocketId).emit("message_delivered", {
                    ids: [message._id.toString()],
                    conversationId: conversation._id.toString(),
                    status: initialMessageStatus
                });
            }

            // Emit to sender with confirmation
            const senderSocketId = req.socketUserMap.get(senderId.toString());
            if (senderSocketId) {
                req.io.to(senderSocketId).emit("message_send", populatedMessage);
            }
        }


        return response(res, 201, "message sent", {
            _id: populatedMessage._id,
            conversationId: conversation._id,
            messageStatus: initialMessageStatus,
            createdAt: populatedMessage.createdAt
        });

    } catch (error) {
        console.error(error);
        return response(res, 500, "cannot send message");
    }
};


// GET MESSAGES (Optimized with pagination)
export const getMessages = async (req, res) => {
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    try {
        const conversation = await Conversation.findById(conversationId).lean();

        if (!conversation) {
            return response(res, 404, "conversation not found");
        }

        if (!conversation.participants.some(p => p.toString() === userId.toString())) {
            return response(res, 403, "not authorized");
        }

        // Pagination for better performance
        const skip = (page - 1) * limit;
        const messages = await Message.find({ conversation: conversationId })
            .populate("sender", "username profilePicture isOnline")
            .populate("receiver", "username profilePicture isOnline")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));

        // Bulk update unread messages (fast operation)
        const result = await Message.updateMany(
            {
                conversation: conversationId,
                receiver: userId,
                messageStatus: { $in: ["sent", "delivered"] }
            },
            {
                $set: { messageStatus: "read", readAt: Date.now() },
                $addToSet: { messageSeenBy: userId }
            }
        );

        // Notify senders about read status (batch)
        if (result.modifiedCount > 0 && req.io && req.socketUserMap) {
            const uniqueSenders = new Set();
            messages.forEach(msg => {
                if (msg.sender && msg.sender._id) {
                    uniqueSenders.add(msg.sender._id.toString());
                }
            });

            uniqueSenders.forEach(senderId => {
                const senderSocket = req.socketUserMap.get(senderId);
                if (senderSocket) {
                    req.io.to(senderSocket).emit("messages_read", {
                        conversationId,
                        count: result.modifiedCount,
                        status: "read",
                        readAt: Date.now()
                    });
                }
            });
        }

        // Reset unread count
        await Conversation.findByIdAndUpdate(conversationId, { unreadCount: 0 });

        return response(res, 200, "messages retrieved", messages.reverse());

    } catch (error) {
        console.error(error);
        return response(res, 500, "cannot get messages");
    }
};


// DELETE MESSAGE
export const deleteMessage = async (req, res) => {

    const { messageId } = req.params;
    const userId = req.user._id;
    // console.log(messageId)

    try {

        const message = await Message.findById(messageId);

        if (!message) {
            return response(res, 404, "message not found");
        }

        // if (messageSenderId !== userId) {
        //     return response(res, 403, "not authorized");
        // }

        // await message.deleteOne();
        message.content = "This message has been deleted";
        message.imageOrVideoUrl = null;
        message.contentType = "text";
        message.isMessageDeleted = true;
        await message.save();


        const conversation = await Conversation.findById(message.conversation);

        if (conversation) {
            if (conversation.lastMessage?.toString() === messageId) {
                const previousMessage = await Message.findOne({
                    conversation: conversation._id,
                    _id: { $ne: message._id }
                }).sort({ createdAt: -1 });

                conversation.lastMessage = previousMessage ? previousMessage._id : undefined;
                await conversation.save();
            }

            if (req.io) {
                const updatedConversation = await Conversation.findById(conversation._id)
                    .populate("participants", "username profilePicture isOnline")
                    .populate({
                        path: "lastMessage",
                        populate: {
                            path: "sender receiver",
                            select: "username profilePicture isOnline"
                        }
                    });

                if (req.socketUserMap) {
                    conversation.participants.forEach((participant) => {
                        const socketId = req.socketUserMap.get(participant.toString());
                        if (socketId) {
                            req.io.to(socketId).emit("conversation_updated", updatedConversation);
                            req.io.to(socketId).emit("message_delete", messageId);
                        }
                    });
                } else {
                    req.io.to(conversation._id.toString()).emit("conversation_updated", updatedConversation);
                    req.io.to(conversation._id.toString()).emit("message_delete", messageId);
                }
            }
        }

        return response(res, 200, "message deleted");

    } catch (error) {

        console.error(error);
        return response(res, 500, "cannot delete message");
    }
};

//getConversation (Fixed with proper lastMessage population)
export const getConversation = async (req, res) => {
    const userId = req.user._id;
    try {
        // Fetch conversations with full lastMessage details
        let conversations = await Conversation.find({
            participants: userId,
        })
            .populate({
                path: "lastMessage",
                select: "content contentType messageStatus sender receiver createdAt",
                populate: {
                    path: "sender receiver",
                    select: "username profilePicture isOnline"
                }
            })
            .populate({
                path: "participants",
                select: "username profilePicture isOnline lastSeen"
            })
            .select("participants lastMessage chatName isGroupChat createdAt updatedAt unreadCount profilePicture")
            .sort({ updatedAt: -1 })
            .lean();

        // Ensure lastMessage has default values
        const enrichedConversations = conversations.map(conv => ({
            ...conv,
            lastMessage: conv.lastMessage ? {
                ...conv.lastMessage,
                content: conv.lastMessage.content || "",
                contentType: conv.lastMessage.contentType || "text"
            } : null
        }));

        return response(res, 200, "conversations retrieved", enrichedConversations);

    } catch (error) {
        console.error("Error fetching conversations:", error);
        return response(res, 500, "cannot get conversations");
    }
};


export const groupMessageSeen = async (req, res) => {
    const { messageId } = req.body;
    const userId = req.user._id;

    try {

        const message = await Message.findById(messageId);

        if (!message) {
            return response(res, 404, "message not found");
        }

        if (message.messageSeenBy.includes(userId)) {
            return response(res, 200, "message already seen");
        }
        message.messageSeenBy.push(userId);
        await message.save();

        if (req.io && req.socketUserMap) {
            const senderSocketId = req.socketUserMap.get(
                message.sender.toString()
            );

            if (senderSocketId) {
                req.io.to(senderSocketId).emit("group_message_seen", {
                    messageId: message._id,
                    userId: userId
                });
            }
        }

        return response(res, 200, "message marked as seen");
    }
    catch (error) {

        console.error(error);
        return response(res, 500, "cannot mark message as seen");

    }
};


// MARK AS READ
export const markAsRead = async (req, res) => {

    const { messageIds } = req.body;
    const userId = req.user._id;

    try {

        const messages = await Message.find({
            _id: { $in: messageIds },
            receiver: userId
        });

        await Message.updateMany(
            {
                _id: { $in: messageIds },
                receiver: userId
            },
            { $set: { messageStatus: "read" } }
        );


        if (req.io && req.socketUserMap) {

            for (const message of messages) {

                const senderSocketId = req.socketUserMap.get(
                    message.sender.toString()
                );

                if (senderSocketId) {

                    req.io.to(senderSocketId).emit("message_Status_update", {
                        messageId: message._id.toString(),
                        messageStatus: "read"
                    });
                }
            }
        }

        return response(res, 200, "messages marked as read");

    } catch (error) {

        console.error(error);
        return response(res, 500, "cannot mark messages");
    }
};