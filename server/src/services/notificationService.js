const path = require('path');
const fs = require('fs');
const { Resend } = require('resend');
const db = require('../config/db');
const twilio = require('twilio');

require('dotenv').config();

const resendClient = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const templatePath = path.join(__dirname, '../templates/notificationEmail.html');
const baseTemplate = fs.readFileSync(templatePath, 'utf-8');

const createNotification = async (userId, title, message) => {
    try {
        const userPreferences = await db.query(
            `SELECT email, phone_number, email_notifications, sms_notifications, in_app_notifications
             FROM users
             WHERE id = $1`,
            [userId]
        );

        const user = userPreferences.rows[0];
        if (!user) return null;

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

        if (user.email_notifications && user.email) {
            const htmlContent = baseTemplate
                .replace(/\{\{title\}\}/g, title)
                .replace(/\{\{message\}\}/g, message);

            try {
                await resendClient.emails.send({
                    from: 'Cut Hut <onboarding@resend.dev>',
                    to: user.email,
                    subject: title || 'New Notification - Cut Hut',
                    html: htmlContent
                });
            } catch (emailErr) {
                console.error(`Failed to send email to ${user.email}:`, emailErr.message);
            }
        }

        if (user.sms_notifications) {
            try {
                const response = await twilioClient.messages.create({
                    body: 'sms_appointment_reminders',
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: user.phone_number
                });
                return { success: true, sid: response.sid };
            } catch (error) {
                console.error('Twilio SMS Error:', error.message);
                return { success: false, error: error.message };
            }
        }

        return createdNotification;
    } catch (error) {
        console.error("Error in creating notification: ", error.message);
        throw error;
    }
};

module.exports = {
    createNotification
};