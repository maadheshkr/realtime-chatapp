const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { sendMessage, allMessages } = require("../controllers/messageController");

const router = express.Router();

// Route to send a message (POST /api/message)
router.route("/").post(protect, sendMessage);

// Route to fetch all messages for a specific chat (GET /api/message/:chatId)
router.route("/:chatId").get(protect, allMessages);

module.exports = router;