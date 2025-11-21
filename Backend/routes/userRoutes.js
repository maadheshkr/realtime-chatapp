const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware'); // <--- Import Middleware

const router = express.Router();

// Chain requests: GET for search (protected), POST for register
router.route('/').post(registerUser).get(protect, allUsers); 

// POST for login
router.post('/login', authUser);

module.exports = router;