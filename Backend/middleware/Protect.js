import jwt from "jsonwebtoken";
import User from "../Models/User.Model.js";

const protect = async (req, res, next) => {
    try {
        let token;

        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({ message: "Not authorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.userId).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "User not found" });
        }

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

export default protect;