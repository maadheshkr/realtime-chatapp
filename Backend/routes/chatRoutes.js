const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { accessChat, fetchChats } = require("../controllers/chatController");

const router = express.Router();

// Route to start/access a chat (POST /api/chat)
router.route("/").post(protect, accessChat);

// Route to get all chats (GET /api/chat)
router.route("/").get(protect, fetchChats);

module.exports = router;