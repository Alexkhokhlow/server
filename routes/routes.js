const express = require("express");

const {
  controllerUser,
  controllerDashboard,
  controllerTaskList,
  controllerTask,
  controllerAuth,
} = require("../controllers/controllers");
const passport = require("passport");
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

router.post("/taskInfo", controllerTask.getTaskInfo);

router.put("/taskInfo", controllerTask.updateTaskInfo);

router.post("/comment", controllerTask.createComment);

router.put("/comment", controllerTask.updateComment);

router.delete("/comment", controllerTask.deleteComment);



module.exports = router;
