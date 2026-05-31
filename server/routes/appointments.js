const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth.js');

router.post('/', verifyToken, async (req, res) => {
    const { barber_id, service_ids, appointment_date, start_time, notes } = req.body;

    const user_id = req.user.id;

    if (!barber_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !appointment_date) {
        return res.status(400).json({ error: "Important missing data" });
    }


    try {
        await db.query('BEGIN');

        const appointmentRes = await db.query(
            `INSERT INTO appointments (user_id, barber_id, appointment_date, start_time, notes, status)
                    VALUES ($1, $2, $3, $4, $5, 'scheduled')
                    RETURNING id`,
                    [user_id, barber_id, appointment_date, start_time, notes]
        );

        const newAppointmentID = appointmentRes.rows[0].id;

        const insertAppServ = await db.query(
            `INSERT INTO appointments_services (appointment_id, service_id, price_at_booking)
                  SELECT $1, id, price
                  FROM services
                  WHERE id = ANY($2)`, [newAppointmentID, service_ids]
        );

        if (insertAppServ.rowCount !== service_ids.length) {
            throw new Error("One or more selected services don't exist in the database");
        }

        await db.query('COMMIT');
        res.status(201).json({ message: "Appointment created successfully" });
    } catch (err) {
        await db.query('ROLLBACK');
        console.log(err);
        res.status(500).json({
            error: "Error in creating appointment",
            message: err.message
        });
    }
});

router.get('/me', verifyToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        const result = await db.query(
            `SELECT appointments.id AS appointment_id,
                         appointments.appointment_date,
                         appointments.start_time,
                         appointments.notes,
                         appointments.status,
                         barbers.first_name AS barber_first_name,
                         barbers.last_name AS barber_last_name,
                         services.service_name,
                         appointment_services.price_at_booking
                  FROM appointments
                  INNER JOIN barbers ON appointments.barber_id = barbers.id
                  INNER JOIN appointment_services ON appointment_services.appointment_id = appointments.id
                  INNER JOIN services ON appointment_services.service_id = services.id
                  WHERE appointments.user_id = $1
                  ORDER BY appointments.appointment_date ASC, appointments.start_time ASC`, [user_id]
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error in listing appointments" });
    }
});

router.get('/list', verifyToken, isAdmin, async (req, res) => {
    try {
        const result = await db.query(
            `SELECT appointments.id AS appointment_id,
                         appointments.appointment_date,
                         appointments.start_time,
                         appointments.notes,
                         appointments.status,
                         users.first_name AS client_first_name,
                         users.last_name AS client_last_name,
                         users.phone_number AS client_phone,
                         barbers.first_name AS barber_first_name,
                         barbers.last_name AS barber_last_name,
                         services.service_name,
                         appointment_services.price_at_booking
                  FROM appointments
                  INNER JOIN users ON appointments.user_id = users.id
                  INNER JOIN barbers ON appointments.barber_id = barbers.id
                  INNER JOIN appointment_services ON appointment_services.appointment_id = appointments.id
                  INNER JOIN services ON appointment_services.service_id = services.id
                  ORDER BY appointments.appointment_date ASC, appointments.start_time ASC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error in listing appointments" });
    }
});

module.exports = router;