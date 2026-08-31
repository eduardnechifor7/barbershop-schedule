const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin, isBarber } = require('../middleware/auth.js');
const appointmentsCtrl = require('../controllers/appointments.controller.js');

// Client routes
router.post('/me/addAppointment', verifyToken, appointmentsCtrl.createMyAppointent);
router.get('/me', verifyToken, appointmentsCtrl.getMyAppointments);
router.patch('/me/cancel/:id', verifyToken, appointmentsCtrl.cancelAppointment);

// Barber / Admin common routes
router.post('/addAppointment', verifyToken, isBarber, appointmentsCtrl.createAppointment);
router.get('/list-as-barber', verifyToken, isBarber, appointmentsCtrl.listAsBarber);
router.post('/create-as-barber', verifyToken, isBarber, appointmentsCtrl.createAsBarber);
router.patch('/edit/:id', verifyToken, isBarber, appointmentsCtrl.editAppointment);
router.delete('/delete/:id', verifyToken, isBarber, appointmentsCtrl.deleteAppointment);
router.patch('/edit-as-barber/:id', verifyToken, isBarber, appointmentsCtrl.editAsBarber);

// Public / Availability check
router.get('/:id/existing-bookings', verifyToken, appointmentsCtrl.getExistingBookings);

// Admin-only route
router.get('/list', verifyToken, isAdmin, appointmentsCtrl.listAllAppointments);

module.exports = router;