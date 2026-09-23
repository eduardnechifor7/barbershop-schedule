const express = require('express');
const router = express.Router();
const { verifyTokenRegistered, isAdmin, isBarber } = require('../middleware/auth.js');
const { strictLimiter, moderateLimiter } = require('../middleware/rateLimiters');
const appointmentsCtrl = require('../controllers/appointments.controller.js');

// Client routes
router.get('/list', verifyTokenRegistered, isAdmin, appointmentsCtrl.listAllAppointments);
router.post('/me/addAppointment', verifyTokenRegistered, strictLimiter, appointmentsCtrl.createMyAppointment);
router.get('/me', verifyTokenRegistered, appointmentsCtrl.getMyAppointments);
router.patch('/me/cancel/:id', verifyTokenRegistered, moderateLimiter, appointmentsCtrl.cancelAppointment);

// Barber / Admin common routes
router.post('/addAppointment', verifyTokenRegistered, isAdmin, strictLimiter, appointmentsCtrl.createAppointment);
router.get('/list-as-barber', verifyTokenRegistered, isBarber, appointmentsCtrl.listAsBarber);
router.post('/create-as-barber', verifyTokenRegistered, isBarber, strictLimiter, appointmentsCtrl.createAsBarber);
router.patch('/edit/:id', verifyTokenRegistered, isAdmin, moderateLimiter, appointmentsCtrl.editAppointment);
router.delete('/delete/:id', verifyTokenRegistered, isBarber, moderateLimiter, appointmentsCtrl.deleteAppointment);
router.patch('/edit-as-barber/:id', verifyTokenRegistered, isBarber, moderateLimiter, appointmentsCtrl.editAsBarber);

// Public / Availability check
router.get('/:id/existing-bookings', verifyTokenRegistered, appointmentsCtrl.getExistingBookings);

module.exports = router;