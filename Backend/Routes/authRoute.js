import express from "express";
import { checkAuthenicated, deleteUser, getAllUsers, logout, searchUser, sendOTP, updateNumber, updateProfile, verifyOtp } from "../Controller/authController.js";
import { multerMiddleware } from "../Config/cloudinaryconfig.js";
import protect from "../middleware/Protect.js";

const authRouter = express.Router();


authRouter.post('/send-otp', sendOTP);
authRouter.post('/verify-otp', verifyOtp);
authRouter.get('/logout', logout)

authRouter.put('/update-profile', protect, multerMiddleware, updateProfile);
authRouter.get('/check-auth', protect, checkAuthenicated);
authRouter.get('/users', protect, getAllUsers)
authRouter.get("/search/:keyword", protect, searchUser);
authRouter.delete("/delete-user", protect, deleteUser);
authRouter.put('/update-number', protect, updateNumber)

export default authRouter;