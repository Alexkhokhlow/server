const express = require("express");

const { signup, login } = require("../controllers/controller");
const userAuth = require("../middleware/userAuth");

const router = express.Router();

router.post("/signup", userAuth.saveUser, signup);

router.post("/login", login);

module.exports = router;
