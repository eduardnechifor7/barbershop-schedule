const express = require('express');
const router = express.Router();
const { verifyTokenRegistered, isAdmin } = require('../middleware/auth.js');
const { moderateLimiter, strictLimiter } = require('../middleware/rateLimiters.js');
const skillsCtrl = require('../controllers/skills.controller.js');

router.get('/list', verifyTokenRegistered, skillsCtrl.listSkills);
router.post('/add', verifyTokenRegistered, isAdmin, strictLimiter, skillsCtrl.addSkill);
router.delete('/delete/:id', verifyTokenRegistered, isAdmin, moderateLimiter, skillsCtrl.deleteSkill);

module.exports = router;