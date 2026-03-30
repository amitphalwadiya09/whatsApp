import { uploadFileToCloudinary } from "../Config/cloudinaryconfig.js";
import Conversation from "../Models/Conversation.model.js";
import Message from "../Models/Message.model.js";
import User from "../Models/User.Model.js";
import response from "../Utils/responseHandler.js";


// SEND MESSAGE
export const sendMessage = async (req, res) => {
    try {

        const { senderId, receiverId, content } = req.body;
        const file = req.file;
        console.log(receiverId, senderId, content, file)
        const participants = [senderId, receiverId].sort();

        let conversation = await Conversation.findOne({
            participants: { $all: participants, $size: 2 }
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants,
                unreadCount: 0,
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

            if (file.mimetype.startsWith("image")) {
                contentType = "image";
            }
            else if (file.mimetype.startsWith("video")) {
                contentType = "video";
            }
            else {
                return response(res, 400, "unsupported file type");
            }

        } else if (content?.trim()) {
            contentType = "text";
        } else {
            return response(res, 400, "message content required");
        }

        // Check if receiver is online to determine initial message status
        const receiver = await User.findById(receiverId);
        const initialMessageStatus = receiver?.isOnline ? "delivered" : "sent";

        const message = await Message.create({
            conversation: conversation._id,
            sender: senderId,
            receiver: receiverId,
            content,
            contentType,
            imageOrVideoUrl,
            messageStatus: initialMessageStatus
        });

        conversation.lastMessage = message._id;

        if (receiverId !== senderId) {
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
        }

        await conversation.save();

        const updatedConversation = await Conversation.findById(conversation._id)
            .populate("participants", "username profilePicture isOnline")
            .populate({
                path: "lastMessage",
                populate: {
                    path: "sender receiver",
                    select: "username profilePicture isOnline"
                }
            });


        const populatedMessage = await Message.findById(message._id)
            .populate("sender", "username profilePicture")
            .populate("receiver", "username profilePicture");

        if (req.io && req.socketUserMap) {

            participants.forEach((participantId) => {
                const socketId = req.socketUserMap.get(participantId.toString());

                if (socketId) {
                    req.io.to(socketId).emit("conversation_updated", updatedConversation);
                }
            });
        }

        if (req.io && req.socketUserMap) {
            const receiverSocketId = req.socketUserMap.get(receiverId);

            if (receiverSocketId) {
                req.io.to(receiverSocketId).emit("receive_message", populatedMessage);

                // Emit delivered status update if receiver is online
                if (initialMessageStatus === "delivered") {
                    req.io.to(receiverSocketId).emit("message_Status_update", {
                        messageId: message._id.toString(),
                        messageStatus: "delivered"
                    });
                }
            }
        }

        return response(res, 201, "message sent", populatedMessage);

    } catch (error) {

        console.error(error);
        return response(res, 500, "cannot send message");
    }
};

// GET MESSAGES
export const getMessages = async (req, res) => {

    const { conversationId } = req.params;
    const userId = req.user._id;

    try {

        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return response(res, 404, "conversation not found");
        }

        if (!conversation.participants.includes(userId)) {
            return response(res, 403, "not authorized");
        }

        const messages = await Message.find({ conversation: conversationId })
            .populate("sender", "username profilePicture")
            .populate("receiver", "username profilePicture")
            .sort({ createdAt: 1 });


        const unreadMessages = await Message.find({
            conversation: conversationId,
            receiver: userId,
            messageStatus: { $in: ["send", "delivered", "seen"] }
        });

        if (unreadMessages.length > 0) {
            const messageIds = unreadMessages.map(m => m._id);
            await Message.updateMany(
                { _id: { $in: messageIds } },
                { $set: { messageStatus: "read" } }
            );

            if (req.io && req.socketUserMap) {
                const uniqueSenders = [...new Set(unreadMessages.map(m => m.sender.toString()))];
                uniqueSenders.forEach(senderId => {
                    const senderSocket = req.socketUserMap.get(senderId);
                    if (senderSocket) {
                        unreadMessages
                            .filter(m => m.sender.toString() === senderId)
                            .forEach(msg => {
                                req.io.to(senderSocket).emit("message_Status_update", {
                                    messageId: msg._id,
                                    messageStatus: "read"
                                });
                            });
                    }
                });
            }
        }

        conversation.unreadCount = 0;
        await conversation.save();

        return response(res, 200, "messages retrieved", messages);

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

//getConversation
export const getConversation = async (req, res) => {
    const userId = req.user._id;
    try {
        let conversations = await Conversation.find({
            participants: userId,
        }).populate({
            path: "lastMessage",
            populate: {
                path: "sender receiver",
                select: "username profilePicture"
            }
        });

        // Sort conversations by lastMessage createdAt timestamp (most recent first)
        conversations.sort((a, b) => {
            const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.updatedAt);
            const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.updatedAt);
            return bTime - aTime; // Most recent first
        });

        return response(res, 201, "conversation get successfully", conversations)
    } catch (error) {
        console.error(error)
        return response(res, 500, 'cannot send a message ')
    }
}

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