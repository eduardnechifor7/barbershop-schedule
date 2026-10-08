const db = require('../config/db');
const logger = require('../config/logger');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const verifySupabaseToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        req.user = {
            ...user,
            uid: user.id
        };
        next();
    } catch (error) {
        logger.error({ error }, "Error verifying Supabase token");
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const verifyTokenRegistered = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        const userQuery = await db.query(
            'SELECT id, role FROM users WHERE supabase_uid = $1',
            [user.id]
        );

        if (userQuery.rows.length === 0) {
            return res.status(404).json({ error: 'User not found in database', user });
        }

        req.user = {
            ...user,
            uid: user.id,
            id: userQuery.rows[0].id,
            role: userQuery.rows[0].role
        };
        next();
    } catch (error) {
        logger.error({ error }, "Error in verifyTokenRegistered");
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};

const isAdmin = (req, res, next) => {
    const user = req.user;

    if (user && user.role === 'Admin') {
        return next();
    }
    return res.status(403).json({ error: 'Unauthorized: Admin access required' });
};

const isBarber = (req, res, next) => {
    const user = req.user;

    if (user && (user.role === 'Barber' || user.role === 'Admin')) {
        return next();
    }
    return res.status(403).json({ error: 'Unauthorized: Barber or Admin access required' });
};

module.exports = { verifyTokenRegistered, verifySupabaseToken, isAdmin, isBarber };