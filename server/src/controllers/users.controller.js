const db = require('../config/db');
const logger = require('../config/logger');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey,
    {
        auth: {
            autoRefreshToken: true,
            persistSession: true
        }
    }
);

const syncUser = async (req, res) => {
    const { first_name, last_name, phone_number, email } = req.body;
    const supabase_uid = req.user.uid;

    try {
        const user = await db.query(
            `INSERT INTO users (supabase_uid, first_name, last_name, phone_number, email)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (supabase_uid)
             DO UPDATE SET
                    first_name = EXCLUDED.first_name,
                    last_name = EXCLUDED.last_name,
                    phone_number = EXCLUDED.phone_number,
                    email = EXCLUDED.email
             RETURNING *`,
            [supabase_uid, first_name, last_name, phone_number, email]
        );
        return res.status(201).json(user.rows[0]);
    } catch (err) {
        logger.error({ err }, "Error in syncUser");
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
        logger.error({ error }, "Error in listUsers");
        return res.status(500).json({ error: "Internal server error" });
    }
};

const checkUserStatus = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, first_name, last_name, role FROM users WHERE supabase_uid = $1",
            [req.user.uid]
        );

        if (result.rows.length === 0) {
            return res.json({isRegistered: false, user: null});
        }

        return res.json({isRegistered: true, user: result.rows[0]});
    } catch (error) {
        logger.error({ error }, "Error in checkUserStatus");
        return res.status(500).json({ error: "Internal server error" });
    }
};

const getUserByUid = async (req, res) => {
    const supabase_uid = req.user.uid;

    try {
        const result = await db.query(
            `SELECT * FROM users WHERE supabase_uid = $1`,
            [supabase_uid]
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
        logger.error({ error }, "Error in getUserByUid");
        return res.status(500).json({ error: "Error in fetching user details" });
    }
};

const editUserById = async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone_number, email, role, photo_url } = req.body;

    try {
        const userResult = await db.query(
            `SELECT supabase_uid, phone_number FROM users WHERE id = $1`,
            [id]
        );
        const user = userResult.rows[0];

        if (!user) return res.status(404).json({ error: "User not found" });

        const updateUser = await db.query(
            `UPDATE users
             SET first_name = COALESCE(NULLIF($1, ''), first_name),
                 last_name = COALESCE(NULLIF($2, ''), last_name),
                 phone_number = COALESCE(NULLIF($3, ''), phone_number),
                 email = COALESCE(NULLIF($4, ''), email),
                 photo_url = COALESCE(NULLIF($5, ''), photo_url),
                 role = COALESCE(NULLIF($6, ''), role)
             WHERE id = $7 RETURNING *`,
            [first_name, last_name, phone_number, email, photo_url, role, id]
        );

        if (updateUser.rows.length === 0) {
            return res.status(404).json({ error: "The user does not exist" });
        }

        return res.status(200).json(updateUser.rows[0]);
    } catch (error) {
        logger.error({ error }, "Error in editUserById");
        return res.status(500).json({ error: "Error in updating user" });
    }
};

const editPhoneNumber = async (req, res) => {
    const { verificationToken } = req.body;
    const userId = req.user?.id;

    if (!verificationToken) {
        return res.status(400).json({ error: "Missing verification token" });
    }

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized session" });
    }

    try {
        const userId = req.user?.id;
        const newPhoneNumber = req.body.phone_number || req.user?.phone;

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized session" });
        }

        if (!newPhoneNumber) {
            return res.status(400).json({ error: "Phone number is missing" });
        }

        const phoneConflict = await db.query(
            "SELECT id FROM users WHERE phone_number = $1 AND id <> $2",
            [newPhoneNumber, userId]
        );

        if (phoneConflict.rows.length > 0) {
            return res.status(409).json({ error: "This phone number is already linked to another account." });
        }

        const updatedUser = await db.query(
            "UPDATE users SET phone_number = $1 WHERE id = $2 RETURNING *",
            [newPhoneNumber, userId]
        );

        if (updatedUser.rows.length === 0) {
            return res.status(404).json({ error: "User not found in database" });
        }

        return res.status(200).json(updatedUser.rows[0]);
    } catch (error) {
        logger.error({ error }, "Error in editPhoneNumber");
        return res.status(500).json({ error: "Error in updating phone number" });
    }
};

const updateMe = async (req, res) => {
    const { first_name, last_name, phone_number, email, photo_url } = req.body;
    const supabase_uid = req.user.uid;

    try {
        const updateUser = await db.query(
            `UPDATE users
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 phone_number = COALESCE($3, phone_number),
                 email = COALESCE($4, email),
                 photo_url = COALESCE($5, photo_url)
             WHERE supabase_uid = $6
             RETURNING *`,
            [first_name, last_name, phone_number, email, photo_url, supabase_uid]
        );

        if (updateUser.rows.length === 0) {
            return res.status(404).json({ error: "The user does not exist" });
        }

        return res.status(200).json(updateUser.rows[0]);
    } catch (error) {
        logger.error({error}, "Error in updating user");
        return res.status(500).json({ error: "Error in updating user" });
    }
};

const updateNotification = async (req, res) => {
    const userId = req.user.id;
    const {email_notifications, in_app_notifications, sms_notifications} = req.body;

    const hasEmail = typeof email_notifications === 'boolean';
    const hasInApp = typeof in_app_notifications === 'boolean';
    const hasSms = typeof sms_notifications === 'boolean';

    if (!hasEmail && !hasInApp && !hasSms) {
        return res.status(400).json({error: "At least one valid boolean preference must be provided"});
    }

    try {
        const updateResult = await db.query(
            `UPDATE users
             SET email_notifications  = COALESCE($1, email_notifications),
                 in_app_notifications = COALESCE($2, in_app_notifications),
                 sms_notifications    = COALESCE($3, sms_notifications)
             WHERE id = $4
             RETURNING id, email_notifications, in_app_notifications, sms_notifications`,
            [
                hasEmail ? email_notifications : null,
                hasInApp ? in_app_notifications : null,
                hasSms ? sms_notifications : null,
                userId
            ]
        );

        if (updateResult.rows.length === 0) {
            return res.status(404).json({error: "The user does not exist"});
        }

        return res.status(200).json({message: "Notification preferences updated successfully"});
    } catch (error) {
        logger.error({error}, "Error in updateNotification");
        return res.status(500).json({ error: "Error in updating notification preferences" });
    }
}

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
        logger.error({error}, "Error in deleteUser");
        return res.status(500).json({ error: "Error in deleting user" });
    }
};

const getClients = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT id, first_name, last_name, phone_number
             FROM users
             WHERE role = 'Customer'
             ORDER BY last_name, first_name `
        );
        res.status(200).json(result.rows);
    } catch (error) {
        logger.error({ error }, "Error in getClients");
        res.status(500).json({ error: "Could not fetch clients" });
    }
};

const deleteMyAccount = async (req, res) => {
    const userId = req.user?.id;
    const supabaseUid = req.user?.uid;

    if (!supabaseUid) {
        return res.status(401).json({ error: "Unauthorized session" });
    }

    try {
        const userRes = await db.query("SELECT photo_url FROM users WHERE id = $1", [userId]);
        const photoUrl = userRes.rows[0]?.photo_url;

        if (photoUrl && photoUrl.includes("/storage/v1/object/public/Avatars/")) {
            const filePath = photoUrl.split("/storage/v1/object/public/Avatars/")[1];
            await supabase.storage.from("Avatars").remove([filePath]);
        }

        const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(supabaseUid);

        if (deleteAuthError) {
            throw deleteAuthError;
        }

        const deleteUserRes = await db.query(
            `DELETE FROM users WHERE id = $1 RETURNING *`, [userId]
        );

        if (deleteUserRes.rowCount === 0) {
            return res.status(404).json({ error: "User was not found in database." });
        }

        res.status(200).json(deleteUserRes.rows[0]);
    } catch (error) {
        logger.error({ error }, "Error in deleteMyAccount");
        res.status(500).json({ error: "Could not delete user" });
    }
};

module.exports = {
    syncUser,
    listUsers,
    getUserByUid,
    editUserById,
    editPhoneNumber,
    updateMe,
    deleteUser,
    getClients,
    updateNotification,
    deleteMyAccount,
    checkUserStatus
};