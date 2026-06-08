const express = require('express');
const { verifyToken, isAdmin } = require('../middleware/auth.js');
const router = express.Router();
const db = require('../db');

router.post('/create', verifyToken, isAdmin, async (req, res) => {
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

router.get('/list', async (req, res) => {
    try {
        const serviceData = await db.query(
            'SELECT * FROM services ORDER BY price'
        );
        res.json(serviceData.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in retrieving data"});
    }
});

router.delete('/delete/:id', verifyToken, isAdmin, async (req, res) => {
   try {
       const { id } = req.params;

       const deletedService = await db.query(
           'UPDATE services SET is_active = false WHERE id = $1 RETURNING *',
           [id]
       );

       if (deletedService.rows.length === 0) {
           return res.status(404).json({ error: "The service does not exist" });
       }

       res.status(200).json({
           message: 'Service status updated successfully',
           deletedService: deletedService.rows[0]
       });
   } catch (err) {
       console.error(err);
       res.status(500).json({ error: "Error in updating barber service" });
   }
});

router.patch('/edit/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const updateActive = await db.query(
            `UPDATE services SET is_active = true WHERE id = $1 RETURNING *`,
            [id]
        );

        if (updateActive.rows.length === 0) {
            return res.status(404).json({ error: "The service does not exist" });
        }

        res.status(200).json({
            message: 'Service status updated successfully',
            statusService: updateActive.rows[0]
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in updating barber service" });
    }
});

module.exports = router;