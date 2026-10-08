const { createInAppNotification, sendExternalNotifications } = require("../services/notificationService");
const { appointmentValidation, executeCreateAppointment } = require('../services/appointmentValidation');
const db = require('../config/db');
const logger = require('../config/logger');

// Add appointment by Client
const createMyAppointment = async (req, res) => {
    const { barber_id, service_ids, appointment_date, start_time, notes } = req.body;
    const userId = req.user.id;

    if (!barber_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !appointment_date || !start_time) {
        return res.status(400).json({ error: "Important missing data" });
    }

    try {
        const result = await executeCreateAppointment({
            userId: userId,
            barberId: barber_id,
            serviceIds: service_ids,
            appointmentDate: appointment_date,
            startTime: start_time,
            notes: notes
        });

        return res.status(201).json(result);
    } catch (err) {
        logger.error({ err }, "Error creating appointment by client");
        const status = err.statusCode || 500;
        return res.status(status).json({ error: err.message || "Error creating appointment" });
    }
};

// Add appointment by Admin
const createAppointment = async (req, res) => {
    const { user_id, barber_id, service_ids, appointment_date, start_time, notes } = req.body;

    if (!user_id || !barber_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !appointment_date || !start_time) {
        return res.status(400).json({ error: "Important missing data" });
    }

    try {
        const result = await executeCreateAppointment({
            userId: user_id,
            barberId: barber_id,
            serviceIds: service_ids,
            appointmentDate: appointment_date,
            startTime: start_time,
            notes: notes
        });

        return res.status(201).json(result);
    } catch (err) {
        logger.error({ err }, "Error creating appointment (Barber/Admin)");
        const status = err.statusCode || 500;
        return res.status(status).json({ error: err.message || "Error creating appointment" });
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
        logger.error({ error }, "Error in getMyAppointments");
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
                    appointments.user_id,
                    appointments.barber_id,
                    clients.first_name AS client_first_name,
                    clients.last_name AS client_last_name,
                    clients.phone_number AS client_phone,
                    clients.photo_url AS client_photo_url,
                    JSON_AGG(
                            JSON_BUILD_OBJECT('service_id', services.id,
                                              'service_name', services.service_name,
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
        logger.error({ error }, "Error in listAsBarber");
        return res.status(500).json({ error: "Error in listing appointments" });
    }
};

// Create appointment as Barber
const createAsBarber = async (req, res) => {
    const { user_id, service_ids, appointment_date, start_time, notes } = req.body;

    if (!user_id || !service_ids || !Array.isArray(service_ids) || service_ids.length === 0 || !appointment_date || !start_time) {
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

        const result = await executeCreateAppointment({
            userId: user_id,
            barberId: barberId,
            serviceIds: service_ids,
            appointmentDate: appointment_date,
            startTime: start_time,
            notes: notes
        });

        return res.status(201).json(result);
    } catch (error) {
        logger.error({ error }, "Error creating appointment as barber");
        const status = error.statusCode || 500;
        return res.status(status).json({
            error: "Unable to create appointment"
        });
    }
};

// Modify appointment as Barber
const editAsBarber = async (req, res) => {
    const { id } = req.params;
    const { appointment_date, start_time, notes, status, service_ids, user_id } = req.body;
    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const currentRes = await client.query(`
            SELECT a.*, b.user_id as barber_user_id
            FROM appointments a
            INNER JOIN barbers b ON a.barber_id = b.id
            WHERE a.id = $1
            FOR UPDATE
        `, [id]);

        if (currentRes.rows.length === 0 || (currentRes.rows[0].barber_user_id !== req.user.id && req.user.role !== 'Admin')) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "The appointment doesn't exist or you are not authorized to edit it." });
        }

        const currentApp = currentRes.rows[0];
        const targetDate = (appointment_date && appointment_date.trim() !== "") ? appointment_date : currentApp.appointment_date;
        const targetTime = (start_time && start_time.trim() !== "") ? start_time : currentApp.start_time;

        let targetServices = service_ids;
        if (!targetServices || !Array.isArray(targetServices) || targetServices.length === 0) {
            const currentServicesRes = await client.query(
                "SELECT service_id FROM appointment_services WHERE appointment_id = $1",
                [id]
            );
            targetServices = currentServicesRes.rows.map(r => r.service_id);
        }

        const { uniqueServiceIds } = await appointmentValidation(client, {
            barberId: currentApp.barber_id,
            appointmentDate: targetDate,
            startTime: targetTime,
            serviceIds: targetServices,
            excludeAppointmentId: id
        });

        const cleanNotes = notes === "" ? null : (notes || currentApp.notes);
        const cleanStatus = status === "" ? null : (status || currentApp.status);
        const cleanUserId = Number(user_id) > 0 ? Number(user_id) : currentApp.user_id;

        const updateAppointment = await client.query(`
            UPDATE appointments
            SET appointment_date = $1,
                start_time = $2,
                notes = $3,
                status = $4,
                user_id = $5
            WHERE id = $6
            RETURNING * `, [targetDate, targetTime, cleanNotes, cleanStatus, cleanUserId, id]
        );

        if (updateAppointment.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "The appointment doesn't exist or you are not authorized to edit it." });
        }

        if (service_ids && Array.isArray(service_ids) && service_ids.length > 0) {
            await client.query(`DELETE FROM appointment_services WHERE appointment_id = $1`, [id]);

            const insertRes = await client.query(`
                INSERT INTO appointment_services (appointment_id, service_id, price_at_booking)
                SELECT $1, id, price
                FROM services
                WHERE id = ANY($2::int[])
            `, [id, uniqueServiceIds]);

            if (insertRes.rowCount !== uniqueServiceIds.length) {
                throw new Error("One or more selected services don't exist in the database");
            }
        }

        await createInAppNotification(
            client,
            cleanUserId,
            "Appointment Updated!",
            `Your appointment has been updated. See you on ${targetDate} at ${targetTime}!`
        );

        await client.query('COMMIT');

        try {
            await sendExternalNotifications(
                cleanUserId,
                "Appointment Updated!",
                `Your appointment has been updated. See you on ${targetDate} at ${targetTime}!`
            );
        } catch (error) {
            logger.error({ error, appointmentId: id }, "External notification delivery failed");
        }

        return res.status(200).json(updateAppointment.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error({ error }, "Error updating appointment");
        return res.status(500).json({ error: "Error in updating appointment." });
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
                    appointments.user_id,
                    appointments.barber_id,
                    clients.first_name AS client_first_name,
                    clients.last_name AS client_last_name,
                    clients.phone_number AS client_phone,
                    barbers_users.first_name AS barber_first_name,
                    barbers_users.last_name AS barber_last_name,
                    JSON_AGG(
                            JSON_BUILD_OBJECT('service_id', services.id,
                                              'service_name', services.service_name,
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
        logger.error({ error }, "Error in listAllAppointments");
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
            `SELECT appointments.start_time, SUM(services.minutes_duration) AS total_duration
             FROM appointments
                      INNER JOIN appointment_services ON appointments.id = appointment_services.appointment_id
                      INNER JOIN services ON appointment_services.service_id = services.id
             WHERE appointments.barber_id = $1
               AND appointments.appointment_date = $2
               AND appointments.status = 'scheduled'
             GROUP BY appointments.id, appointments.start_time`,
            [barberId, date]
        );

        return res.status(200).json(existingBookings.rows);
    } catch (error) {
        logger.error({ error }, "Error in getExistingBookings");
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

        const currentRes = await client.query(
            "SELECT * FROM appointments WHERE id = $1 FOR UPDATE",
            [id]
        );

        if (currentRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "The appointment doesn't exist." });
        }

        const currentApp = currentRes.rows[0];

        const targetBarberId = (barber_id && !isNaN(Number(barber_id))) ? Number(barber_id) : currentApp.barber_id;
        const targetDate = (appointment_date && appointment_date.trim() !== "") ? appointment_date : currentApp.appointment_date;
        const targetTime = (start_time && start_time.trim() !== "") ? start_time : currentApp.start_time;

        let targetServices = service_ids;
        if (!targetServices || !Array.isArray(targetServices) || targetServices.length === 0) {
            const currentServicesRes = await client.query(
                "SELECT service_id FROM appointment_services WHERE appointment_id = $1",
                [id]
            );
            targetServices = currentServicesRes.rows.map(r => r.service_id);
        }

        const { uniqueServiceIds } = await appointmentValidation(client, {
            barberId: targetBarberId,
            appointmentDate: targetDate,
            startTime: targetTime,
            serviceIds: targetServices,
            excludeAppointmentId: id
        });

        const cleanNotes = notes === "" ? null : (notes || currentApp.notes);
        const cleanStatus = status === "" ? null : (status || currentApp.status);
        const cleanUserId = Number(user_id) > 0 ? Number(user_id) : currentApp.user_id;

        const updateAppointment = await client.query(`
            UPDATE appointments
            SET appointment_date = $1,
                start_time = $2,
                notes = $3,
                status = $4,
                user_id = $5,
                barber_id = $6
            WHERE id = $7
            RETURNING *
        `, [targetDate, targetTime, cleanNotes, cleanStatus, cleanUserId, targetBarberId, id]);

        if (service_ids && Array.isArray(service_ids) && service_ids.length > 0) {
            await client.query(`DELETE FROM appointment_services WHERE appointment_id = $1`, [id]);

            const insertRes = await client.query(`
                INSERT INTO appointment_services (appointment_id, service_id, price_at_booking)
                SELECT $1, id, price
                FROM services
                WHERE id = ANY($2::int[])
            `, [id, uniqueServiceIds]);

            if (insertRes.rowCount !== uniqueServiceIds.length) {
                throw new Error("One or more selected services don't exist in the database");
            }
        }

        await createInAppNotification(
            client,
            cleanUserId,
            "Appointment Updated!",
            `Your appointment has been updated. See you on ${targetDate} at ${targetTime}!`
        );

        await client.query('COMMIT');

        try {
            await sendExternalNotifications(
                cleanUserId,
                "Appointment Updated!",
                `Your appointment has been updated. See you on ${targetDate} at ${targetTime}!`
            );
        } catch (error) {
            logger.error({ error, appointmentId: id }, "External notification delivery failed");
        }

        return res.status(200).json(updateAppointment.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        logger.error({ error }, "Error updating appointment by admin");
        const status = error.statusCode || 500;
        return res.status(status).json({
            error: "Unable to update appointment"
        });
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

        const appointmentRes = await client.query(
            `SELECT a.id
             FROM appointments a
                      LEFT JOIN barbers b ON b.id = a.barber_id
             WHERE a.id = $1
               AND (
                 $2 = 'Admin'
                     OR (b.user_id = $3 AND b.id IS NOT NULL)
                 )
                 FOR UPDATE`,
            [id, req.user.role, req.user.id]
        );

        if (appointmentRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({
                error: "Appointment doesn't exist or you are not authorized to delete it."
            });
        }

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
        logger.error({ error }, "Error deleting appointment");
        return res.status(500).json({ error: "Error in deleting appointment." });
    } finally {
        client.release();
    }
};

// Cancel appointment by Client (soft delete)
const cancelAppointment = async (req, res) => {
    const { id } = req.params;
    try {
        const cancelRes = await db.query(
            `UPDATE appointments SET status = 'cancelled' WHERE id = $1 AND user_id = $2 RETURNING *`,
            [id, req.user.id]
        );

        if (cancelRes.rows.length === 0) {
            return res.status(404).json({
                message: "Appointment not found or you are not authorized to cancel it."
            });
        }

        return res.status(200).json({
            message: "Appointment cancelled successfully.",
            appointment: cancelRes.rows[0]
        });
    } catch (error) {
        logger.error({ error }, "Error cancelling appointment");
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createMyAppointment,
    createAppointment,
    getMyAppointments,
    listAsBarber,
    listAllAppointments,
    getExistingBookings,
    editAppointment,
    deleteAppointment,
    createAsBarber,
    editAsBarber,
    cancelAppointment
};