const bcrypt = require("bcrypt");
const db = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const EXPIRES_IN = "10d";

const User = db.users;
const Dashboard = db.dashboard;
const TaskList = db.tasklist;
const Task = db.task;
const Taskinfo = db.taskinfo;
const Comment = db.comment;

const controllerUser = {
  signup: async (request, response) => {
    try {
      const { userName, email, password } = request.body;

      const data = {
        userName,
        email,
        password: await bcrypt.hash(password, 10),
      };
      const user = await User.create(data);
      if (user) {
        return response.status(201).send({ userName, email });
      } else {
        return response.status(400).send("error");
      }
    } catch (error) {
      return response.status(400).send();
    }
  },

  login: async (request, response) => {
    try {
      const { email, password } = request.body;
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (user) {
        const isSame = await bcrypt.compare(password, user.password);

        if (isSame) {
          let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: EXPIRES_IN,
          });
          return response.status(200).json({ token });
        } else {
          return response.status(400).send("Authentication failed");
        }
      }
      return response.status(400).send("Authentication failed");
    } catch (error) {
      return response.status(400).send();
    }
  },

  checkEmail: async (request, response) => {
    try {
      const { email } = request.body;
      const user = await User.findOne({
        where: {
          email: email,
        },
      });
      if (user) {
        return response.status(400).send("This mail is busy");
      } else {
        return response.status(200).json();
      }
    } catch (error) {
      return response.status(400).send();
    }
  },
};

const controllerDashboard = {
  createDashboard: async (request, response) => {
    try {
      const { token, name, color, public } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const key = await bcrypt.hash(token, 10);
        const pathName = key
          .substring(10, 20)
          .toUpperCase()
          .replace(/\/|\./g, "R");
        const data = {
          name,
          color,
          public,
          userId,
          pathName,
        };
        const dashboard = await Dashboard.create(data);
        if (dashboard) {
          return response.status(200).send({
            name,
            color,
            public,
            pathName,
          });
        } else {
          return response.status(400).send("Board creation error");
        }
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      console.log(error);
      return response.status(500).send("Error server");
    }
  },

  getDashboards: async (request, response) => {
    try {
      const { token } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const createdDashboards = await Dashboard.findAll({
          where: {
            userId,
          },
        });
        const availableDashboards = await Dashboard.findAll({
          include: [{ model: User, where: { id: userId } }],
        });
        return response
          .status(200)
          .send({ createdDashboards, availableDashboards });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (e) {
      return response.status(500).send("Error server");
    }
  },

  getDashboard: async (request, response) => {
    try {
      const { token } = request.body;
      const { pathName } = request.params;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const dashboard = await Dashboard.findOne({
          where: {
            pathName: pathName,
          },
        });

        if (dashboard) {
          const creator = dashboard.userId == userId;
          const users = await User.findAll({
            include: [{ model: Dashboard, where: { id: dashboard.id } }],
          });
          const available =
            users.filter((data) => data.userId == userId).length !== 0;
          let dashboardInfo = await Dashboard.findOne({
            include: [
              { model: TaskList, where: { dashboardId: dashboard.id } },
            ],
          });
          if (dashboardInfo) {
            dashboardInfo.dataValues.tasklists = await Promise.all(
              dashboardInfo.tasklists.map(async (data) => {
                let result = await TaskList.findOne({
                  include: [{ model: Task, where: { taskListId: data.id } }],
                });
                return result ? result : data;
              })
            );
          } else {
            dashboardInfo = dashboard;
          }
          if (creator || available) {
            return response
              .status(200)
              .send({ dashboard: dashboardInfo, access: true });
          } else {
            if (dashboard.public) {
              return response
                .status(200)
                .send({ dashboard: dashboardInfo, access: false });
            } else {
              return response.status(403).send("no access to private board");
            }
          }
        } else {
          return response.status(401).send("Dashboard not found");
        }
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      console.log(error, " - error");
      return response.status(500).send("Error server");
    }
  },

  addUserToDashboard: async (request, response) => {
    try {
      const { token, email, pathName } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const user = await User.findOne({
          where: {
            email: email,
          },
        });
        const dashboard = await Dashboard.findOne({
          where: {
            pathName: pathName,
          },
        });
        if (dashboard && user) {
          await dashboard.addUser(user);
          User.findAll({
            include: [{ model: Dashboard, where: { id: dashboard.id } }],
          }).then((users) => {
            response.status(200).send(
              users.map((data) => {
                return { userName: data.userName, email: data.email };
              })
            );
          });
        } else {
          return response.status(400).send("No dashboards created");
        }
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      return response.status(500).send("Error token");
    }
  },
};

const controllerTaskList = {
  createTaskList: async (request, response) => {
    try {
      const { token, pathName, name } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const dashboard = await Dashboard.findOne({
          where: {
            pathName: pathName,
          },
        });
        const taskList = await TaskList.create({ name });
        dashboard.addTasklists(taskList);
        return response.status(200).send({ name, id: taskList.id });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      console.log(error);
      return response.status(500).send("Error token");
    }
  },
};

const controllerTask = {
  createTask: async (request, response) => {
    try {
      const { token, id, name, index } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const taskList = await TaskList.findOne({
          where: {
            id,
          },
        });
        const task = await Task.create({ name, index });
        Taskinfo.create({ tasklist: taskList.name, name, taskId: task.id });
        taskList.addTasks(task);
        return response.status(200).send({ task });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      console.log(error);
      return response.status(500).send("Error token");
    }
  },

  updateTask: async (request, response) => {
    try {
      const { token, id, taskListId, name, index } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const task = await Task.update(
          {
            taskListId,
            name,
            index,
          },
          {
            where: {
              id,
            },
          }
        );
        return response.status(200).send({ task });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      console.log(error);
      return response.status(500).send("Error token");
    }
  },

  getTaskInfo: async (request, response) => {
    const { token, id } = request.body;
    const taskInfo = await Taskinfo.findOne({
      where: {
        taskId: id,
      },
    });
    let comments = await Taskinfo.findOne({
      include: [{ model: Comment, where: { taskinfoId: taskInfo.id } }],
    });
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    if (comments) {
      comments = comments.comments;
    } else {
      comments = [];
    }
    if (userId) {
      const user = await User.findOne({
        where: {
          id: userId,
        },
      });

      return response.status(200).send({
        taskInfo,
        comments: comments,
        user: { name: user.userName, id: user.id },
      });
    } else {
      return response.status(401).send("Unauthorized");
    }
  },

  updateTaskInfo: async (request, response) => {
    const { token, id, description } = request.body;
    const taskInfo = await Taskinfo.update(
      {
        description,
      },
      {
        where: {
          taskId: id,
        },
      }
    );

    return response.status(200).send({ taskInfo });
  },

  createComment: async (request, response) => {
    const { token, id, comment } = request.body;
    const taskInfo = await Taskinfo.findOne({
      where: {
        taskId: id,
      },
    });

    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    if (userId) {
      const user = await User.findOne({
        where: {
          id: userId,
        },
      });
      const commentInfo = await Comment.create({
        userName: user.userName,
        userId,
        text: comment,
      });
      await taskInfo.addComment(commentInfo);
      return response.status(201).send({ commentInfo });
    } else {
      return response.status(401).send("Unauthorized");
    }
  },

  updateComment: async (request, response) => {
    const { token, userId, id, comment } = request.body;
    const userIdToken = jwt.verify(token, process.env.JWT_SECRET).id;
    if (userIdToken) {
      if (userId == userIdToken) {
        const commentData = await Comment.update(
          {
            text: comment,
          },
          {
            where: {
              id,
            },
          }
        );
        return response.status(201).send({ commentData });
      } else {
        return response.status(403).send("No access");
      }
    } else {
      return response.status(401).send("Unauthorized");
    }
  },
  deleteComment: async (request, response) => {
    const { token, userId, id } = request.body;
    const userIdToken = jwt.verify(token, process.env.JWT_SECRET).id;
    if (userIdToken) {
      if (userId == userIdToken) {
        const commentData = await Comment.destroy({
          where: {
            id,
          },
        });
        return response.status(201).send({ commentData });
      } else {
        return response.status(403).send("No access");
      }
    } else {
      return response.status(401).send("Unauthorized");
    }
  },
};

const controllerAuth = {
  google: async (request, response) => {
    return response.status(201).send({ response });
  },
};
module.exports = {
  controllerUser,
  controllerDashboard,
  controllerTaskList,
  controllerTask,
  controllerAuth
  
};
