const express = require("express");

const {
  controllerUser,
  controllerDashboard,
  controllerTaskList,
  controllerTask,
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

router.post("/tasklist", controllerTaskList.createTaskList);

router.post("/task", controllerTask.createTask);

router.put("/task", controllerTask.updateTask);

router.get("/socket.io/?EIO=4&transport=polling&t=OPPAcMF", controllerTask.updateTask);


module.exports = router;
