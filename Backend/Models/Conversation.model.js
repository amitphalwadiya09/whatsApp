import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    chatName: { type: "String", trim: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
    unreadCount: { type: Number, default: 0 },
    groupPic: { type: 'string', default: "" },
    isGroupChat: { type: Boolean, default: false },
    groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" }

}, { timestamps: true });


const Conversation = mongoose.model("Conversation", conversationSchema)
export default Conversation;
