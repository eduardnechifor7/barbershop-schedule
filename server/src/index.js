const express = require('express');
const cors = require('cors');
require('dotenv').config();

require('./config/firebase.js');

const servicesRoutes = require('./routes/services.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const barbersRoutes = require('./routes/barbers.routes');
const usersRoutes = require('./routes/users.routes');
const skillsRoutes = require('./routes/skills.routes');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/barbers', barbersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/skills', skillsRoutes);

app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}`);
});