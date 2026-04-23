const express = require('express');
const router = express.Router();
const db = require('../db');
const admin = require("firebase-admin");

router.post('/', async (req, res) => {
    const { barber_id, service_id, appointment_date, start_time, notes } = req.body;
    const user_id = req.user?.id || 3;
    if (!user_id) return res.status(401).send("Unauthorized");

    if (!barber_id || !service_id || !appointment_date) {
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
        const serviceRes = await db.query(`SELECT price FROM services WHERE id = $1`, [service_id]);
        const currentPrice = serviceRes.rows[0].price;

        await db.query(
            `INSERT INTO appointment_services (appointment_id, service_id, price_at_booking)
                    VALUES ($1, $2, $3)`, [newAppointmentID, service_id, currentPrice]
        );

        await db.query('COMMIT');
        res.status(201).json({ message: "Succes!" });
    } catch (err) {
        await db.query('ROLLBACK');
        console.log(err);
        res.status(500).json({
            error: "Error in creating appointment",
            message: err.message,
            detail: err.detail
        });
    }
});

module.exports = router;