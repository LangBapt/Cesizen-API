const express = require('express');
const cors = require('cors');
require('dotenv').config();
const prisma = require('./config/prisma');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const infoRoutes = require('./routes/information');
const breathingRoutes = require('./routes/exercise');

// Health check — utilisé par Docker HEALTHCHECK, Traefik, et le pipeline de déploiement
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (e) {
    res.status(503).json({ status: 'error', db: 'unreachable' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/informations', infoRoutes);
app.use('/api/exercises', breathingRoutes);

app.listen(PORT, () => {
  console.log(`Serveur CESIZen démarré sur le port ${PORT}`);
});