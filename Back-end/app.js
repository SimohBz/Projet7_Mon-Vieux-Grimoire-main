const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();
const userRoutes = require("./routes/user");
const bookRoutes = require("./routes/book");
const path = require("path");

const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const dotEnv = require("dotenv").config({ path: "./.env" });
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const cluster = process.env.DB_CLUSTER;
if (dotEnv.error) {
  console.error(dotEnv.error);
}

mongoose
  .connect(
    `mongodb+srv://${username}:${password}@${cluster}/?retryWrites=true&w=majority`,

    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());
app.use(cors());

// Protège contre les attaques par injection de mongoDb
app.use(mongoSanitize());

// Helmet
app.use(helmet());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "same-site" },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
  })
);

// Définition des routes de l'API
app.use("/api/auth", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/images", express.static(path.join(__dirname, "images")));

module.exports = app;
