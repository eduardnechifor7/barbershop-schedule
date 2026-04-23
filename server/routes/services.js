const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
    try {
        const { service_name, price, minutes_duration } = req.body;
        const newService = await db.query(
            'INSERT INTO services (service_name, price, minutes_duration) VALUES ($1, $2, $3) RETURNING *',
            [service_name, price, minutes_duration]
        );

        res.status(201).json(newService.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in saving barber service" });
    }
});

router.get('/', async (req, res) => {
    try {
        const serviceData = await db.query(
            'SELECT * FROM services ORDER BY price ASC'
        );
        res.json(serviceData.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in retrieving data"});
    }
});

module.exports = router;