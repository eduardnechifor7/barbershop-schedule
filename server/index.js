const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');
const barbersRoutes = require('./routes/barbers');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/barbers', barbersRoutes);
app.use('/api/users', usersRoutes);

app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ message: "Connected!", time: result.rows[0] });
    } catch (err) {
        console.log(err);
        res.status(500).send("Connecting error with database");
    }
});

app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}`);
});