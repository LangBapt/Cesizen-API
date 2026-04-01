const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const infoRoutes = require('./routes/information');
const breathingRoutes = require('./routes/exercise');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/informations', infoRoutes);
app.use('/api/exercises', breathingRoutes);

app.listen(PORT, () => {
  console.log(`Serveur CESIZen démarré sur le port ${PORT}`);
});