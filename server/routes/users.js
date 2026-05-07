const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/sync', async (req, res) => {
    const { firebase_uid, first_name, last_name, phone_number, email } = req.body;

    try {
        const user = await db.query(
            `INSERT INTO users (firebase_uid, first_name, last_name, phone_number, email)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (firebase_uid) 
             DO UPDATE SET last_name = EXCLUDED.last_name
             RETURNING *`,
            [firebase_uid, first_name, last_name, phone_number, email]
        );
        res.status(201).json(user.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in adding user" });
    }
});

router.get('/check/:phone', async (req, res) => {
    const { phone } = req.params;

    try {
        const result = await db.query(
            'SELECT id FROM users WHERE phone_number = $1',
            [phone]
        );

        if (result.rows.length > 0) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in finding phone number" });
    }
});

module.exports = router;