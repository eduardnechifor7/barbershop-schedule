const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');
const db = require('../db');

router.post('/sync', async (req, res) => {
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
        res.status(201).json(user.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in adding user" });
    }
});

router.get('/list', verifyToken, isAdmin, async (req, res) => {

    try {
        const result = await db.query(
            `SELECT id, first_name, last_name, phone_number, email, role
                    FROM users`
        );


        return res.json(result.rows);
    } catch (error) {
        console.log("Get users error". error);
        return res.status(500).json({ messageL: "Internal server error" });
    }
});

router.get('/check/:phone', async (req, res) => {
    const { phone } = req.params;

    try {
        const result = await db.query(
            'SELECT id, role FROM users WHERE phone_number = $1',
            [phone]
        );

        if (result.rows.length > 0) {
            return res.json({ exists: true,
                                    role: result.rows[0].role
                                    });
        } else {
            return res.json({ exists: false });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error in finding phone number" });
    }
});

router.patch('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone_number, email, role } = req.body;

    try {
        const updateUser = await db.query(
            `UPDATE users
             SET first_name = COALESCE($1, first_name),
                 last_name = COALESCE($2, last_name),
                 phone_number = COALESCE($3, phone_number),
                 email = COALESCE($4, email),
                 role = COALESCE($5, role)
             WHERE id = $6 RETURNING *`, [first_name, last_name, phone_number, email, role, id]
        );

        if (updateUser.rows.length === 0) {
            return res.status(404).json({ error: "The user does not exist" });
        }

        res.status(200).json(updateUser.rows[0]);

    } catch (error) {
        res.status(500).json({ error: "Error in updating user" });
    }
});

router.patch('/me', verifyToken, async (req, res) => {
    const { first_name, last_name, phone_number, email } = req.body;
    const firebase_uid = req.user.uid;

    try {
        const updateUser = await db.query(
            `UPDATE users
                  SET first_name = COALESCE($1, first_name),
                      last_name = COALESCE($2, last_name),
                      phone_number = COALESCE($3, phone_number),
                      email = COALESCE($4, email)
                  WHERE firebase_uid = $5
                  RETURNING *`, [first_name, last_name, phone_number, email, firebase_uid]
        );

        if (updateUser.rows.length === 0) {
            return res.status(404).json({ error: "The user does not exist" });
        }

        res.status(200).json(updateUser.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error in updating user" });
    }
});

router.delete('/:id', verifyToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const deleteUser = await db.query(
            `DELETE from users where id = $1 RETURNING *`, [id]
        );

        if (deleteUser.rows.length === 0) {
            return res.status(404).json({ error: "The user does not exist" });
        }

        res.status(200).json(deleteUser.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Error in deleteing user" });
    }
});

module.exports = router;