require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const informationRoutes = require("./src/routes/information");
const exerciseRoutes = require("./src/routes/exercise");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/informations", informationRoutes);
app.use("/api/exercises", exerciseRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "CESIZen API opérationnelle", timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 CESIZen API démarrée sur http://localhost:${PORT}`);
});

module.exports = { app, server };

