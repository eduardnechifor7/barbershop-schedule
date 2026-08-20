const db = require('../db');

const createNotification = async (userId, title, message) => {
    try {
        const userPreferences = await db.query(
            `SELECT email, email_notifications, sms_notifications, in_app_notifications
                  FROM users
                  WHERE id = $1`, [userId]
        );

        const user = userPreferences.rows[0];
        if (!user) return;


        let createdNotification = null;
        if (user.in_app_notifications) {
            const result = await db.query(
                `INSERT INTO notifications (user_id, title, message)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
                [userId, title, message]
            );
            createdNotification = result.rows[0];
        }

        if (user.email_notifications) {
            // Logic to send email notification
        }

        if (user.sms_notifications) {
            // Logic to send SMS notification
        }

        return createdNotification;
    } catch (error) {
        console.error("Error in creating notification: ", error.message);
    }
};

module.exports = {
    createNotification
};