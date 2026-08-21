const db = require('../config/db');

const listSkills = async (req, res) => {
    try {
        const skills = await db.query(
            `SELECT id, name FROM skills ORDER BY name ASC`
        );
        return res.status(200).json(skills.rows);
    } catch (error) {
        console.error("Error in listSkills:", error);
        return res.status(500).json({ error: 'Error in listing skills' });
    }
};

const addSkill = async (req, res) => {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Skill name is required' });
    }

    try {
        const newSkill = await db.query(
            `INSERT INTO skills (name) VALUES ($1) RETURNING *`,
            [name.trim()]
        );
        return res.status(201).json(newSkill.rows[0]);
    } catch (error) {
        console.error("Error in addSkill:", error);
        return res.status(500).json({ error: 'Error in adding skill' });
    }
};

const deleteSkill = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedSkill = await db.query(
            `DELETE FROM skills WHERE id = $1 RETURNING *`,
            [id]
        );

        if (deletedSkill.rows.length === 0) {
            return res.status(404).json({ error: 'Skill does not exist' });
        }

        return res.status(200).json(deletedSkill.rows[0]);
    } catch (error) {
        console.error("Error in deleteSkill:", error);
        return res.status(500).json({ error: 'Error in deleting skill' });
    }
};

module.exports = {
    listSkills,
    addSkill,
    deleteSkill
};