import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    phoneNumber: { type: String, unique: true, sparse: true },
    phoneSuffix: { type: String, unique: false },
    username: { type: String },
    email: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                return /^\S+@\S+\.\S+$/.test(value);
            },
            message: "Invalid email format"
        }
    },
    password: { type: String, minLength: 6 },
    emailOtp: { type: String },
    emailOtpExpiry: { type: Date },
    profilePicture: { type: String },
    about: { type: String },
    lastSeen: { type: Date },
    isOnline: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    agreed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });



const User = mongoose.model('User', userSchema);
export default User;
