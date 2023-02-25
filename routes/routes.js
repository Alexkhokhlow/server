const express = require("express");

const {
  controllerUser,
  controllerDashboard,
  controllerTaskList,
  controllerTask,
  controllerAuth,
} = require("../controllers/controllers");

const userAuth = require("../middleware/userAuth");

const passport = require("passport");

const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID =
  "9479350765-89gr5t1rpmpd9ao2h4gl0udgu3fntlb5.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "https://trello-clone-x3tl.onrender.com/api/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);

passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

const router = express.Router();

router.post("/token", controllerUser.checkToken);

router.post("/signup", userAuth.saveUser, controllerUser.signup);

router.post("/login", controllerUser.login);

router.post("/email", controllerUser.checkEmail);

router.post("/user", controllerUser.getUserInfo);

router.put("/user", controllerUser.updateUserInfo);

router.post("/dashboard", controllerDashboard.createDashboard);

router.post("/dashboard/:pathName", controllerDashboard.getDashboard);

router.post("/dashboards", controllerDashboard.getDashboards);

router.post("/users_dashboard", controllerDashboard.addUserToDashboard);

router.post("/tasklist", controllerTaskList.createTaskList);

router.delete("/tasklist", controllerTaskList.deleteTaskList);

router.post("/task", controllerTask.createTask);

router.put("/task", controllerTask.updateTask);

router.post("/taskInfo", controllerTask.getTaskInfo);

router.put("/taskInfo", controllerTask.updateTaskInfo);

router.post("/comment", controllerTask.createComment);

router.put("/comment", controllerTask.updateComment);

router.delete("/comment", controllerTask.deleteComment);

router.post("/label", controllerTask.addLabel);

router.put("/label", controllerTask.updateLabel);

router.delete("/label", controllerTask.deleteLabel);

router.post("/labels", controllerTask.getLabels);

router.post("/label/:id", controllerTask.getLabel);

router.post('/todo', controllerTask.createTodo);

router.put('/todo', controllerTask.updateTodo);

router.delete('/todo', controllerTask.deleteTodo);

router.post('/checkList', controllerTask.createCheckList);

router.put('/checkList', controllerTask.updateCheckList);

router.delete('/checkList', controllerTask.deleteCheckList);




router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google"),
  controllerAuth.google
);

module.exports = router;
