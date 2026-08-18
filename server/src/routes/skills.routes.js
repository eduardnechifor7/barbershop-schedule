const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.js');
const skillsCtrl = require('../controllers/skills.controller.js');

router.get('/list', verifyToken, skillsCtrl.listSkills);
router.post('/add', verifyToken, isAdmin, skillsCtrl.addSkill);
router.delete('/delete/:id', verifyToken, isAdmin, skillsCtrl.deleteSkill);

module.exports = router;