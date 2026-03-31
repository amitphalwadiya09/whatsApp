import express from "express";
import cors from "cors";
import dotenv from "dotenv"
import cookieParser from "cookie-parser";
import connectDB from "./Config/DBConfig.js";
import bodyParser from "body-parser";
import authRouter from "./Routes/authRoute.js";
import chatRouter from "./Routes/chatRoute.js";
import http from "http";
import initializeSocket from "./Service/socketService.js";
import statusRouter from "./Routes/statusRoute.js";
import conversationRouter from "./Routes/conversationRoute.js";
import compression from "compression";

dotenv.config();

const PORT = process.env.PORT || 3000;
const app = express();
const frontendURL = process.env.FORNTEND_URL || "http://localhost:5173";

// ✅ Compression middleware (reduce payload size)
app.use(compression());

// ✅ CORS with optimized settings
app.use(cors({
    origin: frontendURL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Request body parsing (optimized)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// ✅ Database connection
connectDB();

// ✅ Serve local uploads (with caching)
app.use("/uploads", express.static("uploads", { maxAge: "1d" }));

// ✅ Create HTTP server with Socket.IO
const server = http.createServer(app);
const io = initializeSocket(server);

// ✅ Attach i/o and socket map to requests
app.use((req, res, next) => {
    req.io = io;
    req.socketUserMap = io.socketUserMap;
    next();
});

// ✅ Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);
app.use('/api/status', statusRouter);
app.use("/api/conversations", conversationRouter);

// ✅ Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: "✅ Server is running" });
});

// ✅ 404 handler
app.use((req, res) => {
    res.status(404).json({ status: 404, message: "Route not found" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
    console.error("❌ Server Error:", err);
    res.status(500).json({ status: 500, message: "Internal server error" });
});

// ✅ Start server
server.listen(PORT, () => {
    console.log(`\n🚀 WhatsApp Clone Server running on port ${PORT}`);
    console.log(`📱 Frontend URL: ${frontendURL}\n`);
});

