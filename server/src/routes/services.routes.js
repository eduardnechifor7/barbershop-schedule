const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.js');
const servicesCtrl = require('../controllers/services.controller.js');

router.post('/create', verifyToken, isAdmin, servicesCtrl.createService);
router.get('/list', servicesCtrl.listServices);
router.delete('/delete/:id', verifyToken, isAdmin, servicesCtrl.deleteService);
router.patch('/edit/:id', verifyToken, isAdmin, servicesCtrl.editService);

module.exports = router;