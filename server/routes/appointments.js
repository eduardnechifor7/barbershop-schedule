const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth.js');

async function createAppointmentLogic(user_id, barber_id, service_ids, appointment_date, start_time, notes) {
    const client = await db.getClient();
    await client.query('BEGIN');

    const appointmentRes = await client.query(
        `INSERT INTO appointments (user_id, barber_id, appointment_date, start_time, notes, status)
                VALUES ($1, $2, $3, $4, $5, 'scheduled')
                RETURNING id`,
        [user_id, barber_id, appointment_date, start_time, notes]
    );

    const newAppointmentID = appointmentRes.rows[0].id;

    const insertAppServ = await client.query(
        `INSERT INTO appointment_services (appointment_id, service_id, price_at_booking)
              SELECT $1, id, price
              FROM services
              WHERE id = ANY($2)`, [newAppointmentID, service_ids]
    );

    if (insertAppServ.rowCount !== service_ids.length) {
        throw new Error("One or more selected services don't exist in the database");
    }

    await client.query('COMMIT');
    return { message: "Appointment created successfully" };
}

router.post('/me/addAppointment', verifyToken, async (req, res) => {
    const { barber_id, service_ids, appointment_date, start_time, notes } = req.body;

    const client = await db.getClient();
    const user_id = req.user.id;

    if (!barber_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !appointment_date) {
        return res.status(400).json({ error: "Important missing data" });
    }


    try {
        const result = await createAppointmentLogic(user_id, barber_id, service_ids, appointment_date, start_time, notes);
        res.status(201).json(result);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({
            error: "Error in creating appointment",
            message: err.message
        });
    }
});

router.post('/addAppointment', verifyToken, isAdmin, async (req, res) => {
    const { user_id, barber_id, service_ids, appointment_date, start_time, notes } = req.body;

    const client = await db.getClient();
    if (!barber_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !appointment_date) {
        return res.status(400).json({ error: "Important missing data" });
    }


    try {
        const result = await createAppointmentLogic(user_id, barber_id, service_ids, appointment_date, start_time, notes);
        res.status(201).json(result);
    } catch (err) {
        await client.query('ROLLBACK');
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
                         barbers.photo_url AS barber_photo_url,
                         JSON_AGG(
                            JSON_BUILD_OBJECT('service_name', services.service_name, 
                                              'price_at_booking', appointment_services.price_at_booking)
                         ) AS services
                  FROM appointments
                  INNER JOIN barbers ON appointments.barber_id = barbers.id
                  INNER JOIN appointment_services ON appointment_services.appointment_id = appointments.id
                  INNER JOIN services ON appointment_services.service_id = services.id
                  WHERE appointments.user_id = $1
                  GROUP BY appointments.id, barbers.last_name, barbers.first_name, barbers.photo_url, appointments.appointment_date, appointments.start_time
                  ORDER BY appointments.appointment_date, appointments.start_time`, [user_id]
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
            `SELECT appointments.id,
                         appointments.appointment_date,
                         appointments.start_time,
                         appointments.notes,
                         appointments.status,
                         users.first_name AS client_first_name,
                         users.last_name AS client_last_name,
                         users.phone_number AS client_phone,
                         barbers.id AS barber_id,
                         barbers.first_name AS barber_first_name,
                         barbers.last_name AS barber_last_name,
                         JSON_AGG(
                            JSON_BUILD_OBJECT('service_name', services.service_name,
                                              'price_at_booking', appointment_services.price_at_booking)
                         ) AS services
                  FROM appointments
                  INNER JOIN users ON appointments.user_id = users.id
                  INNER JOIN barbers ON appointments.barber_id = barbers.id
                  INNER JOIN appointment_services ON appointment_services.appointment_id = appointments.id
                  INNER JOIN services ON appointment_services.service_id = services.id
                  GROUP BY appointments.id, barbers.last_name, barbers.id, barbers.first_name, users.first_name, users.last_name, users.phone_number, appointments.appointment_date, appointments.start_time
                  ORDER BY appointments.appointment_date, appointments.start_time`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error in listing appointments" });
    }
});

router.get('/:id/existing-bookings', verifyToken, async (req, res) => {
    const barberId = req.params.id;
    const date = req.query.date;

    if (!date) {
        return res.status(400).json({ error: "Date query parameter is required" });
    }

    try {
        const existingBookings = await db.query(
            `SELECT appointments.start_time, services.minutes_duration
                  FROM appointments
                  INNER JOIN appointment_services ON appointments.id = appointment_services.appointment_id
                  INNER JOIN services ON appointment_services.service_id = services.id
                  WHERE appointments.barber_id = $1 AND appointments.appointment_date = $2 AND appointments.status = 'scheduled'`,
            [barberId, date]
        );

        res.status(200).json(existingBookings.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed in fetching existing bookings" });
    }
});

router.patch('/edit/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { user_id, barber_id, appointment_date, start_time, notes, status, service_ids } = req.body;

    try {
        const cleanDate = appointment_date === "" ? null : appointment_date;
        const cleanTime = start_time === "" ? null : start_time;
        const cleanNotes = notes === "" ? null : notes;
        const cleanStatus = status === "" ? null : status;
        const cleanUser = user_id === "" ? null : user_id;
        const cleanBarber = barber_id === "" ? null : barber_id;

        const updateAppointment = await db.query(
            `UPDATE appointments
                  SET appointment_date = COALESCE($1, appointment_date),
                      start_time = COALESCE($2, start_time),
                      notes = COALESCE($3, notes),
                      status = COALESCE($4, status),
                      user_id = COALESCE($5, user_id),
                      barber_id = COALESCE($6, barber_id)
                  WHERE id = $7
                  RETURNING *`,
            [cleanDate, cleanTime, cleanNotes, cleanStatus, cleanUser, cleanBarber, id]
        );

        if (updateAppointment.rows.length === 0) {
            return res.status(404).json({ error: "The appointment doesn't exist." });
        }

        if (service_ids && service_ids.length > 0) {
            await db.query(`DELETE FROM appointment_services WHERE appointment_id = $1`, [id]);

            const servicesResult = await db.query(
                `SELECT id, price FROM services WHERE id = ANY($1)`, [service_ids]
            );

            for (const service of servicesResult.rows) {
                await db.query(
                    `INSERT INTO appointment_services (appointment_id, service_id, price_at_booking)
                     VALUES ($1, $2, $3)`,
                    [id, service.id, service.price]
                );
            }
        }

        res.status(200).json(updateAppointment.rows[0]);

    } catch (error) {
        return res.status(500).json({ error: "Error in updating appointment.", details: error.message });
    }
});

router.delete('/delete/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query(
            `DELETE FROM appointment_services WHERE appointment_id = $1`, [id]
        );

        const deleteAppointment = await db.query(
            `DELETE FROM appointments WHERE id = $1 RETURNING *`, [id]
        );

        if (deleteAppointment.rows.length === 0) {
            return res.status(404).json({ error: "Appointments doesn't exist." })
        }

        res.status(200).json(deleteAppointment.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: "Error in deleting appointment. ", details: error.message })
    }
});

router.patch('/delete/me/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const changeApptStatus = await db.query(
            `UPDATE appointments SET status = 'cancelled' WHERE id = $1 AND user_id = $2 RETURNING *`, [id, user_id]
        );

        if (changeApptStatus.rows.length === 0) {
            return res.status(404).json({ error: "Appointments doesn't exist or you are not authorized to change it" })
        }

        res.status(200).json(changeApptStatus.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: "Error in updating appointment. ", details: error.message })
    }
});

module.exports = router;