const express = require('express');
const router = express.Router();
const { verifyTokenRegistered, verifySupabaseToken, isAdmin, isBarber } = require('../middleware/auth');
const { moderateLimiter, strictLimiter } = require('../middleware/rateLimiters');
const usersCtrl = require('../controllers/users.controller');

// Public routes
router.post('/sync', verifySupabaseToken, moderateLimiter, usersCtrl.syncUser);
router.get('/check-status', verifySupabaseToken, usersCtrl.checkUserStatus);

// Current profile routes (Authenticated users)
router.get('/by-uid', verifyTokenRegistered, usersCtrl.getUserByUid);
router.patch('/me', verifyTokenRegistered, moderateLimiter, usersCtrl.updateMe);
router.patch('/update-notification', verifyTokenRegistered, usersCtrl.updateNotification);
router.patch('/edit-phone', verifyTokenRegistered, moderateLimiter, usersCtrl.editPhoneNumber);
router.delete('/delete-account', verifyTokenRegistered, strictLimiter, usersCtrl.deleteMyAccount);

// Administration routes (Admin only)
router.get('/list', verifyTokenRegistered, isAdmin, usersCtrl.listUsers);
router.patch('/edit/:id', verifyTokenRegistered, isAdmin, moderateLimiter, usersCtrl.editUserById);
router.delete('/delete/:id', verifyTokenRegistered, isAdmin, moderateLimiter, usersCtrl.deleteUser);

// Barber-specific routes
router.get('/clients', verifyTokenRegistered, isBarber, usersCtrl.getClients);

module.exports = router;