const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

// Import Routes
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");

// Load environment variables
dotenv.config();

// --- Database Connection ---
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};
connectDB();
// ---------------------------

const app = express();

// --- Middleware ---
app.use(cors()); // Allows Frontend to talk to Backend
app.use(express.json()); // Allows Server to accept JSON data in body

// Create HTTP Server
const server = http.createServer(app);

// --- Routes ---
app.get("/", (req, res) => {
  res.send("API is running successfully");
});

app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);

// --- Socket.io Setup ---
const io = new Server(server, {
  pingTimeout: 60000, // Close connection if inactive for 60s
  cors: {
    origin: "http://localhost:5173", // Your Frontend URL
    methods: ["GET", "POST"],
  },
});

// --- ADVANCED SOCKET LOGIC ---
io.on("connection", (socket) => {
  console.log("Connected to socket.io");

  // 1. SETUP: User joins their own personal room based on their User ID
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    console.log("User Setup:", userData._id);
    socket.emit("connected");
  });

  // 2. JOIN CHAT: User joins a specific chat room
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("User Joined Room: " + room);
  });

  // 3. NEW MESSAGE: Server sends message to everyone else in the room
  socket.on("new message", (newMessageRecieved) => {
    var chat = newMessageRecieved.chat;

    if (!chat.users) return console.log("chat.users not defined");

    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return; // Don't send it back to the sender

      // Send to the other user inside their personal room
      socket.in(user._id).emit("message received", newMessageRecieved);
    });
  });

  // Cleanup when user disconnects
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData._id);
  });
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});