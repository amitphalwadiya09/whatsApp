import jwt from "jsonwebtoken";
import response from "../Utils/responseHandler.js";


const authMiddleware = (req, res, next) => {
    const authToken = req.cookies?.auth_token;

    if (!authToken) {
        return response(res, 401, "authorization token missing")
    }
    try {
        const decode = jwt.verify(authToken, process.env.JWT_SECRET)

        req.user = decode;
        next();
    } catch (error) {
        console.error(error)
        return response(res, 401, 'invalid prexpired token')
    }
}

export default authMiddleware;

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
        req.user = await User.findById(decoded.id).select("-password");

        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
