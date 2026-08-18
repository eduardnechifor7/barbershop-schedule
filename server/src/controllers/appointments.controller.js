const db = require('../db');

// Helper for creating an appointment, used across client, barber, and admin routes
async function executeCreateAppointment(userId, barberId, serviceIds, appointmentDate, startTime, notes) {
    const client = await db.getClient();
    const uniqueServiceIds = [...new Set(serviceIds.map(Number))];

    try {
        await client.query('BEGIN');

        const appointmentRes = await client.query(
            `INSERT INTO appointments (user_id, barber_id, appointment_date, start_time, notes, status)
             VALUES ($1, $2, $3, $4, $5, 'scheduled')
             RETURNING id`,
            [userId, barberId, appointmentDate, startTime, notes]
        );

        const newAppointmentId = appointmentRes.rows[0].id;

        const insertAppServ = await client.query(
            `INSERT INTO appointment_services (appointment_id, service_id, price_at_booking)
             SELECT $1, id, price
             FROM services
             WHERE id = ANY($2::int[])`,
            [newAppointmentId, uniqueServiceIds]
        );

        if (insertAppServ.rowCount !== uniqueServiceIds.length) {
            throw new Error("One or more selected services don't exist in the database");
        }

        await client.query('COMMIT');
        return { message: "Appointment created successfully", appointment_id: newAppointmentId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

// Add appointment by Client
const createMyAppointent = async (req, res) => {
    const { barber_id, service_ids, appointment_date, start_time, notes } = req.body;
    const userId = req.user.id;

    if (!barber_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !appointment_date) {
        return res.status(400).json({ error: "Important missing data" });
    }

    try {
        const result = await executeCreateAppointment(userId, barber_id, service_ids, appointment_date, start_time, notes);
        return res.status(201).json(result);
    } catch (err) {
        console.error("Error creating appointment (Client):", err);
        return res.status(500).json({ error: "Error in creating appointment", message: err.message });
    }
};

// Add appointment by Admin
const createAppointment = async (req, res) => {
    const { user_id, barber_id, service_ids, appointment_date, start_time, notes } = req.body;

    if (!user_id || !barber_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !appointment_date) {
        return res.status(400).json({ error: "Important missing data" });
    }

    try {
        const result = await executeCreateAppointment(user_id, barber_id, service_ids, appointment_date, start_time, notes);
        return res.status(201).json(result);
    } catch (err) {
        console.error("Error creating appointment (Barber/Admin):", err);
        return res.status(500).json({ error: "Error in creating appointment", message: err.message });
    }
};

// Past appointments for Client
const getMyAppointments = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT appointments.id AS appointment_id,
                    appointments.appointment_date,
                    appointments.start_time,
                    appointments.notes,
                    appointments.status,
                    barbers_users.first_name AS barber_first_name,
                    barbers_users.last_name AS barber_last_name,
                    barbers_users.photo_url AS barber_photo_url,
                    JSON_AGG(
                            JSON_BUILD_OBJECT('service_name', services.service_name,
                                              'price_at_booking', appointment_services.price_at_booking)
                    ) AS services
             FROM appointments
                      INNER JOIN barbers ON appointments.barber_id = barbers.id
                      INNER JOIN users AS barbers_users ON barbers.user_id = barbers_users.id
                      INNER JOIN appointment_services ON appointment_services.appointment_id = appointments.id
                      INNER JOIN services ON appointment_services.service_id = services.id
             WHERE appointments.user_id = $1
             GROUP BY appointments.id, barbers_users.last_name, barbers_users.first_name, barbers_users.photo_url, appointments.appointment_date, appointments.start_time
             ORDER BY appointments.appointment_date, appointments.start_time`,
            [userId]
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error in getMyAppointments:", error);
        return res.status(500).json({ error: "Error in listing appointments" });
    }
};

// All appointments for Barber
const listAsBarber = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await db.query(
            `SELECT appointments.id AS appointment_id,
                    appointments.appointment_date,
                    appointments.start_time,
                    appointments.notes,
                    appointments.status,
                    clients.first_name AS client_first_name,
                    clients.last_name AS client_last_name,
                    clients.phone_number AS client_phone,
                    clients.photo_url AS client_photo_url,
                    JSON_AGG(
                            JSON_BUILD_OBJECT('service_name', services.service_name,
                                              'price_at_booking', appointment_services.price_at_booking)
                    ) AS services
             FROM appointments
                      INNER JOIN barbers ON appointments.barber_id = barbers.id
                      INNER JOIN users AS clients ON appointments.user_id = clients.id
                      INNER JOIN appointment_services ON appointment_services.appointment_id = appointments.id
                      INNER JOIN services ON appointment_services.service_id = services.id
             WHERE barbers.user_id = $1
             GROUP BY appointments.id, appointments.appointment_date, appointments.start_time,
                      appointments.notes, appointments.status, clients.first_name,
                      clients.last_name, clients.phone_number, clients.photo_url
             ORDER BY appointments.appointment_date, appointments.start_time`,
            [userId]
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error in listAsBarber:", error);
        return res.status(500).json({ error: "Error in listing appointments" });
    }
};

// Create appointment as Barber
const createAsBarber = async (req, res) => {
    const { user_id, service_ids, appointment_date, start_time, notes } = req.body;

    if (!user_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !appointment_date) {
        return res.status(400).json({ error: "Important missing data" });
    }

    try {
        const barberQuery = await db.query(
            'SELECT id FROM barbers WHERE user_id = $1',
            [req.user.id]
        );

        if (barberQuery.rows.length === 0) {
            return res.status(404).json({ error: "Barber profile not found for this user" });
        }

        const barberId = barberQuery.rows[0].id;

        const result = await executeCreateAppointment(
            user_id,
            barberId,
            service_ids,
            appointment_date,
            start_time,
            notes
        );

        return res.status(201).json(result);
    } catch (error) {
        console.error("Error in createAsBarber:", error);
        return res.status(500).json({ error: "Error in creating appointment", details: error.message });
    }
};

// Modify appointment as Barber
const editAsBarber = async (req, res) => {
    const { id } = req.params;
    const { appointment_date, start_time, notes, status, service_ids } = req.body;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const cleanDate = appointment_date === "" ? null : appointment_date;
        const cleanTime = start_time === "" ? null : start_time;
        const cleanNotes = notes === "" ? null : notes;
        const cleanStatus = status === "" ? null : status;

        const updateAppointment = await client.query(
            `UPDATE appointments
             SET appointment_date = COALESCE($1, appointment_date),
                 start_time = COALESCE($2, start_time),
                 notes = COALESCE($3, notes),
                 status = COALESCE($4, status)
             WHERE id = $5
               AND (
                 EXISTS (
                     SELECT 1 FROM barbers
                     WHERE barbers.id = appointments.barber_id
                       AND barbers.user_id = $6
                 )
                     OR $7 = 'Admin'
                 )
             RETURNING *`,
            [cleanDate, cleanTime, cleanNotes, cleanStatus, id, req.user.id, req.user.role]
        );

        if (updateAppointment.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "The appointment doesn't exist or you are not authorized to edit it." });
        }

        if (service_ids && Array.isArray(service_ids) && service_ids.length > 0) {
            const uniqueServiceIds = [...new Set(service_ids.map(Number))];

            await client.query(`DELETE FROM appointment_services WHERE appointment_id = $1`, [id]);

            await client.query(
                `INSERT INTO appointment_services (appointment_id, service_id, price_at_booking)
                 SELECT $1, id, price
                 FROM services
                 WHERE id = ANY($2::int[])`,
                [id, uniqueServiceIds]
            );
        }

        await client.query('COMMIT');
        return res.status(200).json(updateAppointment.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating appointment:", error);
        return res.status(500).json({ error: "Error in updating appointment.", details: error.message });
    } finally {
        client.release();
    }
};

// All appointments for Admin
const listAllAppointments = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT appointments.id,
                    appointments.appointment_date,
                    appointments.start_time,
                    appointments.notes,
                    appointments.status,
                    clients.first_name AS client_first_name,
                    clients.last_name AS client_last_name,
                    clients.phone_number AS client_phone,
                    barbers.id AS barber_id,
                    barbers_users.first_name AS barber_first_name,
                    barbers_users.last_name AS barber_last_name,
                    JSON_AGG(
                            JSON_BUILD_OBJECT('service_name', services.service_name,
                                              'price_at_booking', appointment_services.price_at_booking)
                    ) AS services
             FROM appointments
                      INNER JOIN users AS clients ON appointments.user_id = clients.id
                      INNER JOIN barbers ON appointments.barber_id = barbers.id
                      INNER JOIN users AS barbers_users ON barbers.user_id = barbers_users.id
                      INNER JOIN appointment_services ON appointment_services.appointment_id = appointments.id
                      INNER JOIN services ON appointment_services.service_id = services.id
             GROUP BY appointments.id, barbers_users.last_name, barbers.id, barbers_users.first_name,
                      clients.first_name, clients.last_name, clients.phone_number,
                      appointments.appointment_date, appointments.start_time
             ORDER BY appointments.appointment_date, appointments.start_time`
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error in listAllAppointments:", error);
        return res.status(500).json({ error: "Error in listing appointments" });
    }
};

// Verify existing bookings for a specific barber on a given date
const getExistingBookings = async (req, res) => {
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
             WHERE appointments.barber_id = $1
               AND appointments.appointment_date = $2
               AND appointments.status = 'scheduled'`,
            [barberId, date]
        );

        return res.status(200).json(existingBookings.rows);
    } catch (error) {
        console.error("Error in getExistingBookings:", error);
        return res.status(500).json({ error: "Failed in fetching existing bookings" });
    }
};

// Modify appointment by Admin
const editAppointment = async (req, res) => {
    const { id } = req.params;
    const { user_id, barber_id, appointment_date, start_time, notes, status, service_ids } = req.body;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const cleanDate = appointment_date === "" ? null : appointment_date;
        const cleanTime = start_time === "" ? null : start_time;
        const cleanNotes = notes === "" ? null : notes;
        const cleanStatus = status === "" ? null : status;
        const cleanUser = user_id === "" ? null : user_id;
        const cleanBarber = barber_id === "" ? null : barber_id;

        const updateAppointment = await client.query(
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
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "The appointment doesn't exist." });
        }

        if (service_ids && Array.isArray(service_ids) && service_ids.length > 0) {
            const uniqueServiceIds = [...new Set(service_ids.map(Number))];

            await client.query(`DELETE FROM appointment_services WHERE appointment_id = $1`, [id]);

            await client.query(
                `INSERT INTO appointment_services (appointment_id, service_id, price_at_booking)
                 SELECT $1, id, price
                 FROM services
                 WHERE id = ANY($2::int[])`,
                [id, uniqueServiceIds]
            );
        }

        await client.query('COMMIT');
        return res.status(200).json(updateAppointment.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating appointment:", error);
        return res.status(500).json({ error: "Error in updating appointment.", details: error.message });
    } finally {
        client.release();
    }
};

// Delete appointment by Admin or Barber
const deleteAppointment = async (req, res) => {
    const { id } = req.params;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        await client.query(`DELETE FROM appointment_services WHERE appointment_id = $1`, [id]);

        const deleteAppointmentRes = await client.query(
            `DELETE FROM appointments WHERE id = $1 RETURNING *`,
            [id]
        );

        if (deleteAppointmentRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Appointment doesn't exist." });
        }

        await client.query('COMMIT');
        return res.status(200).json(deleteAppointmentRes.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error deleting appointment:", error);
        return res.status(500).json({ error: "Error in deleting appointment.", details: error.message });
    } finally {
        client.release();
    }
};

module.exports = {
    createMyAppointent,
    createAppointment,
    getMyAppointments,
    listAsBarber,
    listAllAppointments,
    getExistingBookings,
    editAppointment,
    deleteAppointment,
    createAsBarber,
    editAsBarber
};