const db = require('../db');

// Get all notifications
const getNotifications = async (req, res) => {
    const userId = req.user.id;
    try {
        const notifications = await db.query(
            `SELECT id, user_id, title, message, is_read, created_at
                  FROM notifications
                  WHERE user_id = $1`, [userId]
        );

        res.status(200).json(notifications.rows);
    } catch (error) {
        res.status(500).json({ error: "Error in loading notifications", details: error.message });
    }
}

// Mark a notification as read
const markAsRead = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await db.query(
            `UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
            [parseInt(id, 10), parseInt(userId, 10)]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Notification not found or unauthorized" });
        }

        return res.status(200).json(result.rows[0]);
    } catch (error) {
        return res.status(500).json({ error: "Error updating notification", details: error.message });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    const userId = req.user.id;

    try {
        await db.query(
            `UPDATE notifications 
       SET is_read = TRUE 
       WHERE user_id = $1 AND is_read = FALSE`,
            [parseInt(userId, 10)]
        );

        return res.status(200).json({ message: "All notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// Delete a notification
const deleteNotification = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await db.query(
            `DELETE FROM notifications
                  WHERE id = $1 AND user_id = $2
                  RETURNING *`, [parseInt(id, 10), parseInt(userId, 10)]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Notification not found or unauthorized" });
        }
        return res.status(200).json({ message: "Notification deleted", notification: result.rows[0] });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
};