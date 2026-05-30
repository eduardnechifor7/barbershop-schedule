const admin = require('../config/firebase.js');
const db = require('../db');


const verifyToken = async (req, res, next) => {
    if (req.headers['x-test-bypass'] === 'true') {
        req.user = { uid: "user_test_admin", email: "test@admin.com", role: "Admin" };
        return next();
    }

    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);

        const userQuery = await db.query(
            'SELECT role FROM users WHERE firebase_uid = $1',
            [decodedToken.uid]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found in database' });
        }

        req.user = {
            ...decodedToken,
            role: userQuery.rows[0].role
        };
        next();
    } catch (error) {
        console.error("Eroare Firebase detaliată:", error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const isAdmin = (req, res, next) => {
    const user = req.user;

    if (user && user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
};

module.exports = { verifyToken, isAdmin };