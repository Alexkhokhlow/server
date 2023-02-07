const express = require("express");

const { signup } = require("../controllers/controller");
const userAuth = require("../middleware/userAuth");


const router = express.Router();

router.post("/signup", userAuth.saveUser, signup);

module.exports = router;
