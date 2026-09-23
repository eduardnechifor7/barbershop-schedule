const db = require('../config/db');
const {
    createInAppNotification,
    sendExternalNotifications
} = require("./notificationService");

const appointmentValidation =  async (client, requiredData) => {
    const { barberId, appointmentDate, startTime, serviceIds, excludeAppointmentId } = requiredData;
    const uniqueServiceIds = [...new Set(serviceIds)];

    await client.query(
        "SELECT id FROM barbers WHERE id = $1 FOR UPDATE",
        [barberId]
    );

    const barberHasReqSkills = await client.query(
        `SELECT skill_id 
         FROM services_skills AS ss
         WHERE service_id = ANY($1::int[])
         AND NOT EXISTS (
             SELECT 1
             FROM barber_skills AS bs
             WHERE bs.barber_id = $2 AND bs.skill_id = ss.skill_id
         )
         LIMIT 1`, [uniqueServiceIds, barberId]
    );

    if (barberHasReqSkills.rows.length > 0) {
        const errReqSkills = new Error("The barber does not have the required skills for one or more selected services");
        errReqSkills.statusCode = 400;
        throw errReqSkills;
    }

    const serviceDurationsRes = await client.query(`
            SELECT minutes_duration
            FROM services
            WHERE id = ANY($1::int[])`, [uniqueServiceIds]
    );

    if (serviceDurationsRes.rows.length !== uniqueServiceIds.length) {
        const notFoundErr = new Error("One or more selected services don't exist in the database");
        notFoundErr.statusCode = 404;
        throw notFoundErr;
    }

    const serviceDurations = serviceDurationsRes.rows
        .map(row => row.minutes_duration)
        .reduce((acc, curr) => acc + curr, 0);

    const conflictCheck = await client.query(`
            SELECT a.id
            FROM appointments AS a
                     INNER JOIN appointment_services AS aps ON a.id = aps.appointment_id
                     INNER JOIN services AS s ON aps.service_id = s.id
            WHERE a.barber_id = $1
              AND a.appointment_date = $2
              AND a.status <> 'cancelled'
              AND ($5::int IS NULL OR a.id <> $5)
              AND a.start_time < ($3::time + ($4 || ' minutes')::interval)
            GROUP BY a.id, a.start_time
            HAVING (a.start_time + (SUM(s.minutes_duration) || ' minutes')::interval) > $3::time
        `, [barberId, appointmentDate, startTime, serviceDurations, excludeAppointmentId]);

    if (conflictCheck.rows.length > 0) {
        const conflictErr = new Error("This time slot is no longer available. Please choose another time.");
        conflictErr.statusCode = 409;
        throw conflictErr;
    }

    return { uniqueServiceIds, serviceDurations };
}

const executeCreateAppointment = async (requiredData) => {
    const client = await db.getClient();
    const { userId, barberId, serviceIds, appointmentDate, startTime, notes, excludeAppointmentId = null } = requiredData;
    const uniqueServiceIds = [...new Set(serviceIds.map(Number))];
    try {
        await client.query('BEGIN');

        await appointmentValidation(client, { barberId, appointmentDate, startTime, serviceIds: uniqueServiceIds, excludeAppointmentId });

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

        if (!userId || Number(userId) <= 0) {
            const err = new Error("Invalid user ID");
            err.statusCode = 400;
            throw err;
        }

        await createInAppNotification(
            client,
            userId,
            "Appointment Scheduled!",
            `See you on ${appointmentDate} at ${startTime}!`
        );

        await client.query('COMMIT');

        try {
            await sendExternalNotifications(
                userId,
                "Appointment Scheduled!",
                `See you on ${appointmentDate} at ${startTime}!`
            );
        } catch (error) {
            logger.error(
                { error, userId, appointmentId: newAppointmentId },
                "External notification delivery failed"
            );
        }

        return { message: "Appointment created successfully", appointment_id: newAppointmentId };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

module.exports = {
    executeCreateAppointment,
    appointmentValidation
}
