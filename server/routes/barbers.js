const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.js');
const db = require('../db');

router.get('/list', async (req, res) => {
    try {
        const barbers = await db.query('SELECT id, first_name, last_name, phone_number, specialization, photo_url FROM barbers');
        res.json(barbers.rows);
    } catch (err) {
        res.status(500).json({ error: "Error in loading barbers list" });
    }
});

router.post('/addBarber', verifyToken, isAdmin, async (req, res) => {
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

router.patch('/edit/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone_number, specialization, photo_url } = req.body;

        const updateBarber = await db.query(
            `UPDATE barbers 
                  SET first_name = COALESCE(NULLIF($1, ''), first_name), 
                      last_name = COALESCE(NULLIF($2, ''), last_name), 
                      phone_number = COALESCE(NULLIF($3, ''), phone_number), 
                      specialization = COALESCE(NULLIF($4, ''), specialization), 
                      photo_url = COALESCE(NULLIF($5, ''), photo_url)
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

router.delete('/delete/:id', verifyToken, isAdmin, async (req, res) => {
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