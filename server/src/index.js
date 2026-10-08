const { relaxedLimiter } = require("./middleware/rateLimiters.js");
const express = require('express');
const cors = require('cors');
const logger = require('../src/config/logger');
require('dotenv').config();

const servicesRoutes = require('./routes/services.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const barbersRoutes = require('./routes/barbers.routes');
const usersRoutes = require('./routes/users.routes');
const skillsRoutes = require('./routes/skills.routes');
const notificationsRoutes = require('./routes/notifications.routes');
const systemRoutes = require('./routes/monitoring');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5174',
    'https://barbershop-schedule.vercel.app'
];

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(relaxedLimiter);

app.use("/api/system", systemRoutes);

app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/barbers', barbersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/notifications', notificationsRoutes);


app.listen(PORT, () => {
    logger.info({ port: PORT }, 'Server started');
});