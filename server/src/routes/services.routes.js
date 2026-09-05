const express = require('express');
const router = express.Router();
const { verifyTokenRegistered, isAdmin } = require('../middleware/auth.js');
const { moderateLimiter, strictLimiter } = require('../middleware/rateLimiters.js');
const servicesCtrl = require('../controllers/services.controller.js');

router.post('/create', verifyTokenRegistered, isAdmin, strictLimiter, servicesCtrl.createService);
router.get('/list', servicesCtrl.listServices);
router.delete('/delete/:id', verifyTokenRegistered, isAdmin, moderateLimiter, servicesCtrl.deleteService);
router.patch('/edit/:id', verifyTokenRegistered, isAdmin, moderateLimiter, servicesCtrl.editService);

module.exports = router;