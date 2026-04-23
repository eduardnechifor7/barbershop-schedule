const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const barbers = await db.query('SELECT id, first_name, last_name, specialization, photo_url FROM barbers');
        res.json(barbers.rows);
    } catch (err) {
        res.status(500).json({ error: "Error in loading barbers list" });
    }
});

router.post('/', async (req, res) => {
    const { first_name, last_name, phone_number, specialization, photo_url } = req.body;
    try {
        const newBarber = await db.query(
            `INSERT INTO barbers (first_name, last_name, phone_number, specialization, photo_url) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [first_name, last_name, phone_number, specialization, photo_url]
        );
        res.status(201).json(newBarber.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error in adding barber" });
    }
});

module.exports = router;