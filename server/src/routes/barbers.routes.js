const express = require('express');
const router = express.Router();
const { verifyTokenRegistered, isAdmin, isBarber } = require('../middleware/auth.js');
const { moderateLimiter, strictLimiter } = require('../middleware/rateLimiters.js');
const barbersCtrl = require('../controllers/barbers.controller.js');

router.get('/list', verifyTokenRegistered, barbersCtrl.listBarbers);
router.get('/me', verifyTokenRegistered, isBarber, barbersCtrl.getBarberProfile);
router.get('/:id', verifyTokenRegistered, barbersCtrl.getBarberById);
router.post('/addBarber', verifyTokenRegistered, strictLimiter, isAdmin, barbersCtrl.addBarber);
router.patch('/edit/:id', verifyTokenRegistered, isAdmin, moderateLimiter, barbersCtrl.editBarber);
router.delete('/delete/:id', verifyTokenRegistered, isAdmin, moderateLimiter, barbersCtrl.deleteBarber);

module.exports = router;