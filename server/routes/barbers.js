const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth.js');
const db = require('../db');

router.get('/list', verifyToken, async (req, res) => {
    try {
        const barbers = await db.query(
            `SELECT 
                       b.id, 
                       b.first_name, 
                       b.last_name, 
                       b.phone_number, 
                       b.photo_url, 
                       COALESCE(json_agg(
                                json_build_object('id', s.id, 'name', s.name)) FILTER (WHERE s.name IS NOT NULL), '[]') AS skills
                   FROM barbers AS b
                   LEFT JOIN barber_skills AS bs ON b.id = bs.barber_id
                   LEFT JOIN skills AS s ON bs.skill_id = s.id
                   GROUP BY b.id`
        );
        res.status(200).json(barbers.rows);
    } catch (error) {
        res.status(500).json({ error: "Error in loading barbers list", details: error.message });
    }
});

router.get('/:id', verifyToken, async (req, res) => {
    const { id } = req.params;
    try {
        const barbers = await db.query(
            `SELECT
                 b.id,
                 b.first_name,
                 b.last_name,
                 b.phone_number,
                 b.photo_url,
                 COALESCE(json_agg(s.name) FILTER (WHERE s.name IS NOT NULL), '[]') AS skills
             FROM barbers AS b
                      LEFT JOIN barber_skills AS bs ON b.id = bs.barber_id
                      LEFT JOIN skills AS s ON bs.skill_id = s.id
             WHERE b.id = $1
             GROUP BY b.id`, [id]
        );

        if (barbers.rows.length === 0) {
            return res.status(404).json({ error: "The barber does not exist" });
        }

        res.status(200).json(barbers.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error in loading barbers details", details: error.message });
    }
});

router.post('/addBarber', verifyToken, isAdmin, async (req, res) => {
    const { first_name, last_name, phone_number, skills_ids, photo_url } = req.body;

    if (!first_name || !last_name || !phone_number || !skills_ids || !Array.isArray(skills_ids) || skills_ids.length === 0) {
        return res.status(400).json({ error: "Missing required fields or skills_ids is not a valid array" });
    }

    const client = await db.getClient();

    try {
        await client.query('BEGIN');
        const newBarber = await client.query(
            `INSERT INTO barbers (first_name, last_name, phone_number, photo_url) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [first_name, last_name, phone_number, photo_url]
        );

        const newBarberId = newBarber.rows[0].id;

        const insertSkillsBarbers = await client.query(
            `INSERT INTO barber_skills (barber_id, skill_id)
                  SELECT $1, id
                  FROM skills
                  WHERE id = ANY($2::int[])`, [newBarberId, skills_ids]
        );

        if (insertSkillsBarbers.rowCount !== skills_ids.length) {
            throw new Error("One or more selected skills don't exist in the database");
        }

        await client.query('COMMIT');
        res.status(201).json({ message: "Barber added successfully", barber: newBarber.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: "Error in adding barber", details: err.message });
    } finally {
        client.release();
    }
});

router.patch('/edit/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone_number, photo_url, skills_ids } = req.body;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const updateBarber = await client.query(
            `UPDATE barbers 
             SET first_name = COALESCE(NULLIF($1, ''), first_name), 
                 last_name = COALESCE(NULLIF($2, ''), last_name), 
                 phone_number = COALESCE(NULLIF($3, ''), phone_number), 
                 photo_url = COALESCE(NULLIF($4, ''), photo_url)
             WHERE id = $5
             RETURNING *`,
            [first_name, last_name, phone_number, photo_url, id]
        );

        if (updateBarber.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "The barber does not exist" });
        }

        if (skills_ids && Array.isArray(skills_ids)) {
            await client.query(`DELETE FROM barber_skills WHERE barber_id = $1`, [id]);

            if (skills_ids.length > 0) {
                const insertSkills = await client.query(
                    `INSERT INTO barber_skills (barber_id, skill_id)
                     SELECT $1, id
                     FROM skills
                     WHERE id = ANY($2::int[])`,
                    [id, skills_ids]
                );

                if (insertSkills.rowCount !== skills_ids.length) {
                    throw new Error("One or more selected skills don't exist in the database");
                }
            }
        }

        await client.query('COMMIT');
        res.status(200).json({ message: "Barber updated successfully", barber: updateBarber.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: "Error in updating barber", details: err.message });
    } finally {
        client.release();
    }
});

router.delete('/delete/:id', verifyToken, isAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const deleteBarber = await db.query(
            `DELETE FROM barbers
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (deleteBarber.rows.length === 0) {
            return res.status(404).json({ error: "The barber does not exist" });
        }

        res.status(200).json({ message: "Barber deleted successfully", barber: deleteBarber.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error in deleting barber", details: err.message });
    }
});

module.exports = router;