const bcrypt = require("bcrypt");
const db = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const EXPIRES_IN = "10d";

const User = db.users;
const Dashboard = db.dashboard;
const TaskList = db.tasklist;
const Task = db.task;

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
        console.log(data);
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
          dashboardInfo.dataValues.tasklists = await Promise.all(
            dashboardInfo.tasklists.map(
              async (data) =>
                await TaskList.findOne({
                  include: [{ model: Task, where: { taskListId: data.id } }],
                })
            )
          );
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
      console.log(error);
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
};

module.exports = {
  controllerUser,
  controllerDashboard,
  controllerTaskList,
  controllerTask,
};
