const express = require("express");
const router = express.Router();
const userCtrl = require("../controllers/user");

const validEmail = require("../middleware/email-validator");
const validPassword = require("../middleware/password-validator");

const rateLimit = require("express-rate-limit");
const limitUserLogin = rateLimit({
  windowMs: 5 * 60 * 1000, // équivaut à 5min
  max: 50,
  message: "Vous avez effectué trop de tentatives de connexion",
});

router.post("/signup", validEmail, validPassword, userCtrl.signup);
router.post("/login", limitUserLogin, userCtrl.login);

module.exports = router;
