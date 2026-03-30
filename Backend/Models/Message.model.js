import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    content: { type: String },
    imageOrVideoUrl: { type: String },
    contentType: { type: String, enum: ['image', 'video', 'text', "audio", "file", "system"] },
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String
    }],
    messageSeenBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messageStatus: {
        type: String,
        enum: ["sent", "delivered", "read"],
        default: "sent"
    },
    isMessageDeleted: { type: Boolean, default: false }

}, { timestamps: true })



const Message = mongoose.model("Message", messageSchema);
export default Message;