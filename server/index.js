const express = require('express');
const cors = require('cors');
const db = require('./db');
require('dotenv').config();

require('./config/firebase.js');

const servicesRoutes = require('./routes/services');
const appointmentsRoutes = require('./routes/appointments');
const barbersRoutes = require('./routes/barbers');
const usersRoutes = require('./routes/users');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/services', servicesRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/barbers', barbersRoutes);
app.use('/api/users', usersRoutes);

app.listen(PORT, () => {
    console.log(`Server runs on port ${PORT}`);
});