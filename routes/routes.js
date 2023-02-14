const express = require("express");

const {
  controllerUser,
  controllerDashboard,
} = require("../controllers/controllers");
const userAuth = require("../middleware/userAuth");

const router = express.Router();

router.post("/signup", userAuth.saveUser, controllerUser.signup);

router.post("/login", controllerUser.login);

router.post("/email", controllerUser.checkEmail);

router.post("/dashboard", controllerDashboard.createDashboard);

router.post("/dashboard/:pathName", controllerDashboard.getDashboard);

router.post("/dashboards", controllerDashboard.getDashboards);

router.post("/users_dashboard", controllerDashboard.addUserToDashboard);

module.exports = router;
