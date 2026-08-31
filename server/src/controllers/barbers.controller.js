const db = require('../config/db');

const listBarbers = async (req, res) => {
    try {
        const barbers = await db.query(
            `SELECT 
                       b.id, 
                       u.first_name AS first_name,
                       u.last_name AS last_name,
                       u.phone_number AS phone_number,
                       u.photo_url AS photo_url,
                       COALESCE(json_agg(
                                json_build_object('id', s.id, 'name', s.name)) FILTER (WHERE s.name IS NOT NULL), '[]') AS skills_ids
                   FROM barbers AS b
                   INNER JOIN users AS u ON b.user_id = u.id
                   LEFT JOIN barber_skills AS bs ON b.id = bs.barber_id
                   LEFT JOIN skills AS s ON bs.skill_id = s.id
                   GROUP BY b.id, u.id, u.first_name
                   ORDER BY u.first_name`
        );
        res.status(200).json(barbers.rows);
    } catch (error) {
        res.status(500).json({ error: "Error in loading barbers list", details: error.message });
    }
};

const getBarberById = async (req, res) => {
    const { id } = req.params;
    try {
        const barbers = await db.query(
            `SELECT
                 b.id,
                 u.first_name AS first_name,
                 u.last_name AS last_name,
                 u.phone_number AS phone_number,
                 u.photo_url AS photo_url,
                 COALESCE(json_agg(
                          json_build_object('id', s.id, 'name', s.name)) FILTER (WHERE s.name IS NOT NULL), '[]') AS skills_ids
             FROM barbers AS b
                      INNER JOIN users AS u ON b.user_id = u.id
                      LEFT JOIN barber_skills AS bs ON b.id = bs.barber_id
                      LEFT JOIN skills AS s ON bs.skill_id = s.id
             WHERE b.id = $1
             GROUP BY b.id, u.id, u.first_name
             ORDER BY u.first_name`, [id]
        );

        if (barbers.rows.length === 0) {
            return res.status(404).json({ error: "The barber does not exist" });
        }

        res.status(200).json(barbers.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error in loading barbers details", details: error.message });
    }
};

const getBarberProfile = async (req, res) => {
    const userId = req.user.id;
    try {
        const barbers = await db.query(
            `SELECT
                 b.id,
                 u.first_name AS first_name,
                 u.last_name AS last_name,
                 u.phone_number AS phone_number,
                 u.photo_url AS photo_url,
                 COALESCE(json_agg(
                          json_build_object('id', s.id, 'name', s.name)) FILTER (WHERE s.name IS NOT NULL), '[]') AS skills_ids
             FROM barbers AS b
                      INNER JOIN users AS u ON b.user_id = u.id
                      LEFT JOIN barber_skills AS bs ON b.id = bs.barber_id
                      LEFT JOIN skills AS s ON bs.skill_id = s.id
             WHERE b.user_id = $1
             GROUP BY
                 b.id,
                 u.first_name,
                 u.last_name,
                 u.phone_number,
                 u.photo_url
             ORDER BY u.first_name`, [userId]
        );

        if (barbers.rows.length === 0) {
            return res.status(404).json({ error: "The barber does not exist" });
        }

        res.status(200).json(barbers.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error in loading barbers details", details: error.message });
    }
};

const addBarber = async (req, res) => {
    const { user_id, skills_ids } = req.body;

    if (!user_id || isNaN(Number(user_id))) {
        return res.status(400).json({ error: "A valid user_id is required" });
    }

    if (!skills_ids || !Array.isArray(skills_ids) || skills_ids.length === 0) {
        return res.status(400).json({ error: "Missing required fields or skills_ids is not a valid array" });
    }

    const uniqueSkillIds = [...new Set(skills_ids)];
    const client = await db.getClient();

    try {
        await client.query('BEGIN');
        const newBarber = await client.query(
            `INSERT INTO barbers (user_id) 
             VALUES ($1) RETURNING *`,
            [user_id]
        );

        const newBarberId = newBarber.rows[0].id;

        const updateRole = await client.query(
            `UPDATE users SET role = 'Barber' WHERE id = $1 RETURNING *`, [user_id]
        );

        if (updateRole.rowCount === 0) {
            throw new Error("User not found");
        }

        const insertSkillsBarbers = await client.query(
            `INSERT INTO barber_skills (barber_id, skill_id)
                  SELECT $1, id
                  FROM skills
                  WHERE id = ANY($2::int[])`, [newBarberId, uniqueSkillIds]
        );

        if (insertSkillsBarbers.rowCount !== uniqueSkillIds.length) {
            throw new Error("One or more selected skills don't exist in the database");
        }

        await client.query('COMMIT');
        res.status(201).json({
            message: "Barber added successfully",
            barber: {
                ...newBarber.rows[0],
                user: updateRole.rows[0]
            }
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: "Error in adding barber", details: err.message });
    } finally {
        client.release();
    }
};

const editBarber = async (req, res) => {
    const { id } = req.params;
    const { skills_ids } = req.body;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        if (skills_ids && Array.isArray(skills_ids)) {
            await client.query(`DELETE FROM barber_skills WHERE barber_id = $1`, [id]);

            const uniqueSkillIds = [...new Set(skills_ids)];
            if (uniqueSkillIds.length > 0) {
                const insertSkills = await client.query(
                    `INSERT INTO barber_skills (barber_id, skill_id)
                     SELECT $1, id
                     FROM skills
                     WHERE id = ANY($2::int[])`,
                    [id, uniqueSkillIds]
                );

                if (insertSkills.rowCount !== uniqueSkillIds.length) {
                    throw new Error("One or more selected skills don't exist in the database");
                }
            }
        }

        await client.query('COMMIT');

        res.status(200).json({
            message: "Barber updated successfully",
            barber_id: id
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: "Error in updating barber", details: err.message });
    } finally {
        client.release();
    }
};

const deleteBarber = async (req, res) => {
    const { id } = req.params;
    try {
        const deleteBarber = await db.query(
            `DELETE FROM barbers
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (deleteBarber.rows.length === 0) {
            return res.status(404).json({ error: "The barber does not exist" });
        }

        const userId = deleteBarber.rows[0].user_id;

        if (userId) {
            await db.query(
                `UPDATE users 
                 SET role = 'Customer' 
                 WHERE id = $1`,
                [userId]
            );
        }

        res.status(200).json({ message: "Barber deleted successfully", barber: deleteBarber.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "Error in deleting barber", details: err.message });
    }
};

module.exports = {
    listBarbers,
    getBarberById,
    addBarber,
    editBarber,
    deleteBarber,
    getBarberProfile
};