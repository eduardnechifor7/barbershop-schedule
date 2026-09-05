const admin = require('../config/firebase.js');
const db = require('../config/db');

const verifyFirebaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);

        req.user = decodedToken;
        next();
    } catch (error) {
        console.error("Firebase Auth Error:", error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const verifyTokenRegistered = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decodedToken = await admin.auth().verifyIdToken(token);

        const userQuery = await db.query(
            'SELECT id, role FROM users WHERE firebase_uid = $1',
            [decodedToken.uid]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found in database', decodedToken: decodedToken });
        }

        req.user = {
            ...decodedToken,
            id: userQuery.rows[0].id,
            role: userQuery.rows[0].role
        };
        next();
    } catch (error) {
        console.error("Firebase error:", error);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const isAdmin = (req, res, next) => {
    const user = req.user;

    if (user && user.role === 'Admin') {
        return next();
    } else {
        return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }
};

const isBarber = (req, res, next) => {
    const user = req.user;

    if (user && (user.role === 'Barber' || user.role === 'Admin')) {
        return next();
    } else {
        return res.status(403).json({ error: 'Unauthorized: Barber or Admin access required' });
    }
}

module.exports = { verifyTokenRegistered, verifyFirebaseToken, isAdmin, isBarber };