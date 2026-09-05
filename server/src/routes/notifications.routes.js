const express = require('express');
const router = express.Router();
const { verifyTokenRegistered } = require('../middleware/auth.js');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notifications.controller.js');
const {moderateLimiter} = require("../middleware/rateLimiters");

// Routes for notifications
router.get('/list', verifyTokenRegistered, getNotifications);
router.put('/mark-as-read/:id', verifyTokenRegistered, markAsRead);
router.put('/mark-all-as-read', verifyTokenRegistered, markAllAsRead);
router.delete('/delete/:id', verifyTokenRegistered, deleteNotification);

module.exports = router;