const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.js');
const barbersCtrl = require('../controllers/barbers.controller.js');

router.get('/list', verifyToken, barbersCtrl.listBarbers);
router.get('/:id', verifyToken, barbersCtrl.getBarberById);
router.post('/addBarber', verifyToken, isAdmin, barbersCtrl.addBarber);
router.patch('/edit/:id', verifyToken, isAdmin, barbersCtrl.editBarber);
router.delete('/delete/:id', verifyToken, isAdmin, barbersCtrl.deleteBarber);

module.exports = router;