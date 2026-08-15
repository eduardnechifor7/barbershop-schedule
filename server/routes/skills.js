const express = require('express');
const router = express.Router();
const db = require('../db');
const { verifyToken, isAdmin } = require('../middleware/auth.js');

// GET all skills
router.get('/list', verifyToken, async (req, res) => {
    try {
        const skills = await db.query(
            `SELECT id, name FROM skills`
        );
        res.status(200).json(skills.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error in listing skills' });
    }
});

// POST a new skill
router.post('/add', verifyToken, isAdmin, async (req, res) => {
    const { name } = req.body;

    try {
        const newSkill = await db.query(
            `INSERT INTO skills (name) VALUES ($1) RETURNING *`,
            [name]
        );
        res.status(201).json(newSkill.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error in adding skill' });
    }
});

// DELETE a skill
router.delete('/delete/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSkill = await db.query(
            `DELETE FROM skills WHERE id = $1 RETURNING *`,
            [id]
        );
        res.status(200).json(deletedSkill.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error in deleting skill' });
    }
});

module.exports = router;