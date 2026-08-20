const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth.js');
const { getNotifications, markAsRead, markAllAsRead, deleteNotification } = require('../controllers/notifications.controller.js');

// Routes for notifications
router.get('/list', verifyToken, getNotifications);
router.put('/mark-as-read/:id', verifyToken, markAsRead);
router.put('/mark-all-as-read', verifyToken, markAllAsRead);
router.delete('/delete/:id', verifyToken, deleteNotification);

module.exports = router;