const db = require('../db');
const admin = require('firebase-admin');

const syncUser = async (req, res) => {
    const { firebase_uid, first_name, last_name, phone_number, email } = req.body;

    try {
        const user = await db.query(
            `INSERT INTO users (firebase_uid, first_name, last_name, phone_number, email)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (firebase_uid) 
             DO UPDATE SET last_name = EXCLUDED.last_name
             RETURNING *`,
            [firebase_uid, first_name, last_name, phone_number, email]
        );
        return res.status(201).json(user.rows[0]);
    } catch (err) {
        console.error("Error in syncUser:", err);
        return res.status(500).json({ error: "Error in adding user" });
    }
};

const listUsers = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, first_name, last_name, phone_number, email, role, photo_url
             FROM users`
        );
        return res.status(200).json(result.rows);
    } catch (error) {
        return res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

const checkPhone = async (req, res) => {
    const { phone } = req.params;

    try {
        const result = await db.query(
            'SELECT id, role FROM users WHERE phone_number = $1',
            [phone]
        );

        if (result.rows.length > 0) {
            return res.status(200).json({
                exists: true,
                role: result.rows[0].role
            });
        } else {
            return res.status(200).json({ exists: false });
        }
    } catch (err) {
        console.error("Error in checkPhone:", err);
        return res.status(500).json({ error: "Error in finding phone number" });
    }
};

const getUserByUid = async (req, res) => {
    const firebase_uid = req.user.uid;

    try {
        const result = await db.query(
            `SELECT * FROM users WHERE firebase_uid = $1`,
            [firebase_uid]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const [countRes, barberRes] = await Promise.all([
            db.query(
                `SELECT COUNT(*)::int AS count
                 FROM appointments
                 WHERE user_id = $1`,
                [user.id]
            ),
            db.query(
                `SELECT CONCAT(u.first_name, ' ', SUBSTRING(u.last_name, 1, 1), '.') AS name
                 FROM appointments a
                 JOIN barbers b ON a.barber_id = b.id
                 JOIN users u ON b.user_id = u.id
                 WHERE a.user_id = $1
                 GROUP BY b.id, u.first_name, u.last_name
                 ORDER BY COUNT(a.id) DESC
                 LIMIT 1`,
                [user.id]
            )
        ]);

        return res.status(200).json({
            ...user,
            total_appointments: countRes.rows[0]?.count || 0,
            favourite_barber: barberRes.rows[0]?.name || "N/A"
        });
    } catch (error) {
        return res.status(500).json({ error: "Error in fetching user details", details: error.message });
    }
};

const editUserById = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone_number, email, role, photo_url } = req.body;

    try {
        const userResult = await db.query(
            `SELECT firebase_uid, phone_number FROM users WHERE id = $1`,
            [id]
        );
        const user = userResult.rows[0];

        if (!user) return res.status(404).json({ error: "User not found" });

        if (phone_number && phone_number !== user.phone_number) {
            await admin.auth().updateUser(user.firebase_uid, { phoneNumber: phone_number });
        }

        const updateUser = await db.query(
            `UPDATE users
             SET first_name = COALESCE(NULLIF($1, ''), first_name),
                 last_name = COALESCE(NULLIF($2, ''), last_name),
                 phone_number = COALESCE(NULLIF($3, ''), phone_number),
                 email = COALESCE(NULLIF($4, ''), email),
                 photo_url = COALESCE($5, photo_url),
                 role = COALESCE(NULLIF($6, ''), role)
             WHERE id = $7 RETURNING *`,
            [first_name, last_name, phone_number, email, photo_url, role, id]
        );

        if (updateUser.rows.length === 0) {
            return res.status(404).json({ error: "The user does not exist" });
        }

        return res.status(200).json(updateUser.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: "Error in updating user", details: error.message });
    }
};

const updateMe = async (req, res) => {
    const { first_name, last_name, phone_number, email, photo_url } = req.body;
    const firebase_uid = req.user.uid;

    try {
        const updateUser = await db.query(
            `UPDATE users
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 phone_number = COALESCE($3, phone_number),
                 email = COALESCE($4, email),
                 photo_url = COALESCE($5, photo_url)
             WHERE firebase_uid = $6
             RETURNING *`,
            [first_name, last_name, phone_number, email, photo_url, firebase_uid]
        );

        if (updateUser.rows.length === 0) {
            return res.status(404).json({ error: "The user does not exist" });
        }

        return res.status(200).json(updateUser.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: "Error in updating user", details: error.message });
    }
};

const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const deleteUserRes = await db.query(
            `DELETE FROM users WHERE id = $1 RETURNING *`,
            [id]
        );

        if (deleteUserRes.rows.length === 0) {
            return res.status(404).json({ error: "The user does not exist" });
        }
        return res.status(200).json(deleteUserRes.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: "Error in deleting user", details: error.message });
    }
};

const getClients = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, first_name, last_name, phone_number 
             FROM users 
             WHERE role = 'Customer'
             ORDER BY last_name, first_name ASC`
        );
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching clients:", error);
        res.status(500).json({ error: "Could not fetch clients" });
    }
};

module.exports = {
    syncUser,
    listUsers,
    checkPhone,
    getUserByUid,
    editUserById,
    updateMe,
    deleteUser,
    getClients
};