const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, isBarber } = require('../middleware/auth');
const usersCtrl = require('../controllers/users.controller');

// Public routes (No authentication required)
router.post('/sync', usersCtrl.syncUser);
router.get('/check/:phone', usersCtrl.checkPhone);

// Current profile routes (Authenticated users)
router.get('/by-uid', verifyToken, usersCtrl.getUserByUid);
router.patch('/me', verifyToken, usersCtrl.updateMe);

// Administration routes (Admin only)
router.get('/list', verifyToken, isAdmin, usersCtrl.listUsers);
router.patch('/edit/:id', verifyToken, isAdmin, usersCtrl.editUserById);
router.delete('/delete/:id', verifyToken, isAdmin, usersCtrl.deleteUser);

// Barber-specific routes
router.get('/clients', verifyToken, isBarber, usersCtrl.getClients);

module.exports = router;