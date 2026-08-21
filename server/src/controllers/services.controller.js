const db = require('../config/db');

const createService = async (req, res) => {
    const { service_name, price, minutes_duration, description, skills_ids = [] } = req.body;

    if (!service_name || !price || !minutes_duration || !description || !skills_ids || !Array.isArray(skills_ids)) {
        return res.status(400).json({ error: "Missing required fields or skills_ids is not a valid array" });
    }

    const uniqueSkillsIds = [...new Set(skills_ids)];
    const client = await db.getClient();

    try {
        await client.query('BEGIN');
        const newService = await client.query(
            'INSERT INTO services (service_name, price, minutes_duration, description) VALUES ($1, $2, $3, $4) RETURNING *',
            [service_name, price, minutes_duration, description]
        );

        const newServiceId = newService.rows[0].id;

        if (uniqueSkillsIds.length > 0) {
            const insertServiceSkills = await client.query(
                `INSERT INTO services_skills (service_id, skill_id)
                 SELECT $1, id
                 FROM skills
                 WHERE id = ANY($2::int[])`,
                [newServiceId, uniqueSkillsIds]
            );

            if (insertServiceSkills.rowCount !== uniqueSkillsIds.length) {
                throw new Error("One or more selected skills don't exist in the database");
            }
        }

        await client.query('COMMIT');

        res.status(201).json({ message: "Service created successfully", service: newService.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: "Error in saving barber service", error: err.message });
    } finally {
        client.release();
    }
};

const listServices = async (req, res) => {
    try {
        const serviceData = await db.query(
            `SELECT
                 s.id AS service_id,
                 s.service_name AS service_name,
                 s.price AS price,
                 s.minutes_duration AS minutes_duration,
                 s.is_active AS is_active,
                 s.description AS description,
                 COALESCE(json_agg(
                          json_build_object('id', sk.id, 'name', sk.name)
                                  ) FILTER (WHERE sk.name IS NOT NULL), '[]') AS required_skills
             FROM services AS s
                      LEFT JOIN services_skills AS ss ON s.id = ss.service_id
                      LEFT JOIN skills AS sk ON ss.skill_id = sk.id
             GROUP BY s.id
             ORDER BY s.id ASC`
        );
        res.status(200).json(serviceData.rows);
    } catch (error) {
        res.status(500).json({ error: "Error in retrieving data", details: error.message });
    }
};

const deleteService = async (req, res) => {
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
};

const editService = async (req, res) => {
    const { id } = req.params;
    const { service_name, price, minutes_duration, description, is_active, skills_ids } = req.body;

    const client = await db.getClient();

    try {
        await client.query('BEGIN');

        const updateService = await client.query(
            `UPDATE services
             SET service_name = COALESCE($1, service_name),
                 price = COALESCE($2::numeric, price),
                 minutes_duration = COALESCE($3::integer, minutes_duration),
                 description = COALESCE($4, description),
                 is_active = COALESCE($5::boolean, is_active)
             WHERE id = $6
             RETURNING *`,
            [
                service_name !== undefined ? service_name : null,
                price !== undefined ? price : null,
                minutes_duration !== undefined ? minutes_duration : null,
                description !== undefined ? description : null,
                is_active !== undefined ? is_active : null,
                id
            ]
        );

        if (updateService.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "The service does not exist" });
        }

        if (skills_ids !== undefined && Array.isArray(skills_ids)) {
            const uniqueSkillsIds = [...new Set(skills_ids)];

            await client.query(`DELETE FROM services_skills WHERE service_id = $1`, [id]);

            if (uniqueSkillsIds.length > 0) {
                const insertSkills = await client.query(
                    `INSERT INTO services_skills (service_id, skill_id)
                     SELECT $1, id
                     FROM skills
                     WHERE id = ANY($2::int[])`,
                    [id, uniqueSkillsIds]
                );

                if (insertSkills.rowCount !== uniqueSkillsIds.length) {
                    throw new Error("One or more selected skills don't exist in the database");
                }
            }
        }

        await client.query('COMMIT');

        res.status(200).json({
            message: 'Service updated successfully',
            service: updateService.rows[0]
        });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ message: "Error in updating barber service", error: err.message });
    } finally {
        client.release();
    }
};

module.exports = {
    createService,
    listServices,
    deleteService,
    editService
};