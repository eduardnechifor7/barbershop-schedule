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

router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone_number, specialization, photo_url } = req.body;

        if (!first_name || !last_name || !phone_number || !specialization || !photo_url) {
            return res.status(400).json({
                error: "All fields are required",
            });
        }

        const updateBarber = await db.query(
            `UPDATE barbers 
                  SET first_name = $1, last_name = $2, phone_number = $3, specialization = $4, photo_url = $5
                  WHERE id = $6
                  RETURNING *`, [first_name, last_name, phone_number, specialization, photo_url, id]
        );

        if (updateBarber.rows.length === 0) {
            return res.status(404).json({ error: "The barber does not exist" });
        }

        res.status(200).json(updateBarber.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error in updating barber" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteBarber = await db.query(
            `DELETE FROM barbers 
                  WHERE id = $1
                  RETURNING *`, [id]
        );

        if (deleteBarber.rows.length === 0) {
            return res.status(404).json({ error: "The barber does not exist" });
        }

        res.status(200).json(deleteBarber.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Error in deleteing barber" });
    }
});

module.exports = router;