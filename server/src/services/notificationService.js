const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const twilio = require('twilio');
const logger = require('../config/logger');
const nodemailer = require('nodemailer');

require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const templatePath = path.join(__dirname, '../templates/notificationEmail.html');
const baseTemplate = fs.readFileSync(templatePath, 'utf-8');

const createInAppNotification = async (client, userId, title, message) => {
    const result = await client.query(
        `INSERT INTO notifications (user_id, title, message)
                 VALUES ($1, $2, $3)
                 RETURNING *`,
        [userId, title, message]
    );

    return result.rows[0];
};

const sendExternalNotifications = async (userId, title, message) => {
    const userPreferences = await db.query(
        `SELECT email, phone_number, email_notifications, sms_notifications
         FROM users
         WHERE id = $1`,
        [userId]
    );

    const user = userPreferences.rows[0];

    if (!user) {
        return;
    }

    if (user.email_notifications && user.email) {
        try {
            const htmlContent = baseTemplate
                .replace(/\{\{title}}/g, title)
                .replace(/\{\{message}}/g, message);

            await transporter.sendMail({
                from: '"CutHut Barbershop" <cuthut.barbershop@gmail.com>',
                to: user.email,
                subject: 'Appointment Confirmation',
                html: htmlContent
            });
        } catch (error) {
            logger.error({ error, userId }, "Email notification failed");
        }
    }

    if (user.sms_notifications && user.phone_number) {
        try {
            await twilioClient.messages.create({
                body: message,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: user.phone_number
            });
        } catch (error) {
            logger.error({ error, userId }, "SMS notification failed");
        }
    }
};

module.exports = {
    createInAppNotification,
    sendExternalNotifications
};