import User from "../Models/User.Model.js";
import otpGenerater from "../Utils/otpGenerater.js";
import sendOtpToEmail from "../Service/emailService.js";
import { sendOtpToPhoneNumber, TwilloverifyOtp } from "../Service/twilloService.js"
import generateToken from "../Utils/generateToken.js";
import response from "../Utils/responseHandler.js"
import { uploadFileToCloudinary } from "../Config/cloudinaryconfig.js";
import Conversation from "../Models/Conversation.model.js";
import sendOtpToEmailJS from "../Service/emailjsService.js";



// OTP generation controller
export const sendOTP = async (req, res) => {
    const { phoneNumber, phoneSuffix, email } = req.body;
    const otp = await otpGenerater();
    const expiry = new Date(Date.now() + 5 * 60 * 1000);
    let user;

    try {
        if (email) {
            user = await User.findOne({ email });
            if (!user) {
                user = new User({ email });
            }
            user.emailOtp = otp;
            user.emailOtpExpiry = expiry;
            await user.save();
            // await sendOtpToEmail(email, otp)
            await sendOtpToEmailJS(email, otp);
            return response(res, 200, 'OTP send to your email');
        }
        if (!phoneNumber || !phoneSuffix) {
            return response(res, 400, "phone number is required");
        }
        const fullPhoneNumber = phoneSuffix + phoneNumber;
        user = await User.findOne({ phoneNumber });
        if (!user) {
            user = await new User({ phoneNumber, phoneSuffix });
        }

        await sendOtpToPhoneNumber(fullPhoneNumber)
        await user.save();

        return response(res, 200, "otp send successfully")
    } catch (error) {
        console.error(error)
        return response(res, 500, "internal server error");
    }
}

// Verify OTP
export const verifyOtp = async (req, res) => {
    const { phoneNumber, phoneSuffix, email, otp } = req.body;

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
            if (!user) {
                return response(res, 404, "User not found")
            }
            const now = new Date();
            if (!user.emailOtp || String(user.emailOtp) !== String(otp) || now > new Date(user.emailOtpExpiry)) {
                return response(res, 400, "otp is invalid")
            }
            user.isVerified = true;
            user.emailOtp = null;
            user.emailOtpExpiry = null;
            user.isOnline = true;


            await user.save();
        }

        else {

            if (!phoneNumber) {
                return response(res, 400, "Phone number required")
            }
            const fullPhoneNumber = `${phoneSuffix}${phoneNumber}`;
            user = await User.findOne({ phoneNumber: fullPhoneNumber });
            if (!user) {
                return response(res, 404, "user not found")
            }
            const result = await TwilloverifyOtp(fullPhoneNumber, otp);
            if (result.status !== "approved") {
                return response(res, 400, "Invalid OTP")

            }
            user.isVerified = true;
            await user.save();


        }
        const token = generateToken(user?._id);

        return response(res, 200, "OTP verified successfully", { token, user })
    } catch (error) {
        console.error(error)
        return response(res, 500, "Internal server error");
    }
}

//update phone Number
export const updateNumber = async (req, res) => {
    const { phoneNumber } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        if (phoneNumber) {
            user.phoneNumber = phoneNumber
        }

        await user.save();
        return response(res, 200, "user Number updated", user);
    } catch (error) {
        console.error(error);
        return response(res, 500, "internal server error");
    }
}
// update user profile
export const updateProfile = async (req, res) => {
    const { username, agreed, about } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);
        const file = req.file;

        if (file) {
            const uploadResult = await uploadFileToCloudinary(file);
            user.profilePicture = uploadResult?.secure_url;
        }
        else if (req.body.profilePicture) {
            user.profilePicture = req.body.profilePicture;
        }

        if (username) user.username = username;
        if (agreed) user.agreed = agreed;
        if (about) user.about = about;

        await user.save();

        return response(res, 200, "user profile updated", user);

    } catch (error) {
        console.error(error);
        return response(res, 500, "internal server error");
    }
};

//check authenication
export const checkAuthenicated = async (req, res) => {
    try {
        const userId = req.user._id;
        if (!userId) {
            return response(res, 404, "username is not authorize")
        }
        const user = await User.findById(userId);
        if (!user) {
            return response(res, 404, "user not found");
        }

        return response(res, 200, "user retrived and allow to use whatapp")
    } catch (error) {
        console.error(error)
        return response(res, 400, "user is not authorize ")
    }
}

//logout user
export const logout = () => {
    try {
        res.cookie("auth_token", "", { expires: new Date(0) })
        return response(res, 200, "user logout successfully")
    } catch (error) {
        console.error(error)
        return response(res, 400, "logout failed")
    }
}

export const getAllUsers = async (req, res) => {
    const loggedInUser = req.user._id;
    try {
        const users = await User.find({ _id: { $ne: loggedInUser }, isDeleted: { $ne: true } }).select(
            "username phoneNumber phoneSuffix profilePicture about lastSeen isOnline isDeleted"
        ).lean();
        const usersWithConversation = await Promise.all(
            users.map(async (user) => {
                const conversation = await Conversation.findOne({
                    participants: { $all: [loggedInUser, user?._id] }
                }).populate({
                    path: "lastMessage",
                    select: ' content sender receiver'
                }).lean();
                return {
                    ...user,
                    conversation: conversation || null
                }
            })
        )
        return response(res, 200, "user retived successfully", usersWithConversation)
    } catch (error) {
        console.error(error);
        return response(res, 400, "error in getting all users")
    }
}

export const searchUser = async (req, res) => {
    try {
        const keyword = req.params.keyword;

        if (!keyword) {
            return res.status(400).json({ message: "Search keyword required" });
        }

        const users = await User.find({
            $and: [
                { _id: { $ne: req.user._id } },
                {
                    $or: [
                        { username: { $regex: keyword, $options: "i" } },
                        { phoneNumber: { $regex: keyword, $options: "i" } },
                    ],
                },
            ],
        }).select("-password");

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const userId = req.user._id;
    try {
        if (!userId) {
            return response(res, 400, "User ID is required");
        }
        const deletedUser = await User.findByIdAndUpdate(
            userId,
            {
                email: `deleted_${userId}@deleted.com`,
                phoneNumber: undefined,
                username: "Deleted User",
                profilePicture: null,
                about: null,
                isVerified: false,
                isDeleted: true,
                isOnline: false
            },
            { returnDocument: "after", runValidators: true }
        );

        if (!deletedUser) {
            return response(res, 404, "User not found");
        }

        return response(res, 200, "Account deleted successfully", { user: deletedUser });

    } catch (error) {
        console.error("Delete user error:", error);
        return response(res, 500, "Internal server error");
    }
};
