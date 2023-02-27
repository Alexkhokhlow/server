const bcrypt = require("bcrypt");
const db = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();
let io = "";

function createIO(server) {
  io = require("socket.io")(server, {
    cors: {
      origin: "http://localhost:8080",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("boardConnection", (data) => {
      socket.join(data);
    });
    socket.on("board", (data) => {
      socket.broadcast.to(data).emit("board");
    });

    socket.on("taskInfo", (data) => {
      io.sockets.to(data).emit("board");
      socket.broadcast.to(data).emit("taskInfo", data);
    });
    socket.on("label", (data) => {
      io.sockets.to(data).emit("board", data);
      io.sockets.to(data).emit("label", data);
    });
  });
}

const EXPIRES_IN = "10d";

const User = db.users;
const Dashboard = db.dashboard;
const TaskList = db.tasklist;
const Task = db.task;
const Taskinfo = db.taskinfo;
const Comment = db.comment;
const Labels = db.labels;
const CheckList = db.checkList;
const Todo = db.todo;

const colors = [
  {
    color: "#7BC86C",
    title: "green",
  },
  {
    color: "#F5DD29",
    title: "yellow",
  },
  {
    color: "#FFAF3F",
    title: "orange",
  },
  {
    color: "#EF7564",
    title: "red",
  },
  {
    color: "#CD8DE5",
    title: "purple",
  },
  {
    color: "#A86CC1",
    title: "purple dark",
  },
  {
    color: "#5BA4CF",
    title: "blue",
  },
];

const controllerUser = {
  checkToken: async (request, response) => {
    try {
      const { token } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        return response.status(200).send({ success: true });
      } else {
        return response.status(400).send("error token");
      }
    } catch (error) {
      return response.status(400).send("error token");
    }
  },

  signup: async (request, response) => {
    try {
      const { userName, email, password, color } = request.body;

      const data = {
        userName,
        email,
        color,
        password: await bcrypt.hash(password, 10),
      };
      const user = await User.create(data);
      if (user) {
        return response.status(201).send({ userName, email });
      } else {
        console.log(error);
        return response.status(400).send("error");
      }
    } catch (error) {
      console.log(error);
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

  getUserInfo: async (request, response) => {
    try {
      const { token } = request.body;
      const id = jwt.verify(token, process.env.JWT_SECRET).id;
      if (id) {
        const user = await User.findOne({
          where: {
            id,
          },
        });

        return response
          .status(200)
          .json({
            name: user.userName,
            email: user.email,
            info: user.info,
            color: user.color,
          });
      }
      return response.status(401).send("Unauthorized");
    } catch (error) {
      return response.status(400).send();
    }
  },

  updateUserInfo: async (request, response) => {
    try {
      const { token, info, userName } = request.body;
      const id = jwt.verify(token, process.env.JWT_SECRET).id;
      if (id) {
        const user = await User.update(
          {
            info,
            userName,
          },
          {
            where: {
              id,
            },
          }
        );

        return response.status(200).json({ name: user.name, info: user.info });
      }
      return response.status(401).send("Unauthorized");
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
          colors.forEach(async (info, index) => {
            Labels.create({
              color: info.color,
              text: "",
              title: info.title,
              index,
              dashboardId: dashboard.id,
            });
          });

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
          const creatorInfo = await User.findOne({
            where: {
              id: dashboard.userId,
            },
          });
          const creator = dashboard.userId == userId;
          const users = await User.findAll({
            include: [{ model: Dashboard, where: { id: dashboard.id } }],
          });
          const available =
            users.filter((data) => data.id == userId).length !== 0;
          let dashboardInfo = await Dashboard.findOne({
            order: [[TaskList, "createdAt", "ASC"]],
            include: [
              { model: TaskList, where: { dashboardId: dashboard.id } },
            ],
          });
          const labels = await Labels.findAll({
            order: [["index", "ASC"]],
            where: { dashboardId: dashboard.id },
          });
          if (dashboardInfo) {
            dashboardInfo.dataValues.tasklists = await Promise.all(
              dashboardInfo.tasklists.map(async (data) => {
                const result = await TaskList.findOne({
                  order: [[Task, "index", "ASC"]],
                  include: [
                    {
                      model: Task,
                      where: { taskListId: data.id },
                    },
                  ],
                });
                if (result) {
                  result.dataValues.tasks = await Promise.all(
                    result.tasks.map(async (task) => {
                      let labels = await Labels.findAll({
                        order: [[Task, "index", "ASC"]],
                        include: [{ model: Task, where: { id: task.id } }],
                      });
                      task.dataValues.labels = labels ? labels : [];

                      let taskInfo = await Taskinfo.findOne({
                        where: { id: task.id },
                      });

                      task.dataValues.description = taskInfo.description
                        ? taskInfo.description
                        : "";

                      let checkLists = await CheckList.findAll({
                        include: [{ model: Taskinfo, where: { id: task.id } }],
                      });

                      let comments = await Comment.findAll({
                        include: [{ model: Taskinfo, where: { id: task.id } }],
                      });
                      task.dataValues.comments = comments ? comments.length : 0;
                      if (checkLists) {
                        checkLists = await Promise.all(
                          checkLists.map(async (item) => {
                            let checkLists = await Todo.findAll({
                              include: [
                                { model: CheckList, where: { id: item.id } },
                              ],
                            });
                            let checked = 0;
                            let unchecked = 0;
                            checkLists.forEach((todo) => {
                              if (todo.checked) {
                                checked += 1;
                              } else {
                                unchecked += 1;
                              }
                            });
                            return { checked, all: checked + unchecked };
                          })
                        );
                        checkLists = checkLists.reduce(
                          (acc, item) => {
                            return (acc = {
                              checked: acc.checked + item.checked,
                              all: acc.all + item.all,
                            });
                          },
                          { checked: 0, all: 0 }
                        );
                        task.dataValues.checkLists = [checkLists];
                      } else {
                        task.dataValues.checkLists = [];
                      }

                      return task;
                    })
                  );

                  data.dataValues.tasks = result.tasks;
                } else {
                  data.dataValues.tasks = [];
                }
                return data;
              })
            );
          } else {
            dashboardInfo = dashboard;
          }
          if (creator || available) {
            return response.status(200).send({
              dashboard: dashboardInfo,
              labels,
              users: { users: users, creator: creatorInfo },
              id: dashboard.id,
              access: true,
            });
          } else {
            if (dashboard.public) {
              return response.status(200).send({
                dashboard: dashboardInfo,
                labels,
                users,
                id: dashboard.id,
                access: false,
              });
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
          return response.status(400).send("User not fround");
        }
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      return response.status(500).send("Error sever");
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
        await dashboard.addTasklists(taskList);
        io;
        return response.status(200).send({ name, id: taskList.id });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      return response.status(500).send("Error token");
    }
  },

  updateTaskList: async (request, response) => {
    try {
      const { token, id, name } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const item = await TaskList.findOne({
          where: {
            id,
          },
        });

        Taskinfo.update(
          {
            tasklist: name,
          },
          {
            where: {
              tasklist: item.name,
            },
          }
        );
        const taskList = await TaskList.update(
          {
            name,
          },
          {
            where: {
              id,
            },
          }
        );
        return response.status(200).send({ taskList });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      return response.status(500).send("Error token");
    }
  },

  deleteTaskList: async (request, response) => {
    try {
      const { token, boardId, id } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const dashboard = await Dashboard.findOne({
          where: {
            id: boardId,
          },
        });
        const taskList = await TaskList.findOne({
          where: {
            id,
          },
        });
        await Task.destroy({
          where: {
            taskListId: id,
          },
        });
        dashboard.removeTasklist(taskList);
        taskList.destroy();
        return response.status(200).send({ success: true });
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
        const taskList = await TaskList.findOne({
          where: {
            id: taskListId,
          },
        });
        Taskinfo.update(
          {
            tasklist: taskList.name,
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
      return response.status(500).send("Error token");
    }
  },

  deleteTask: async (request, response) => {
    try {
      const { token, id } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        Comment.destroy({
          where: {
            taskinfoId: id,
          },
        });
        CheckList.destroy({
          where: {
            taskinfoId: id,
          },
        });

        Taskinfo.destroy({
          where: {
            taskId: id,
          },
        });
        await Task.destroy({
          where: {
            id,
          },
        });
        return response.status(200).send({ success: true });
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
      order: [[Comment, "createdAt", "ASC"]],
      include: [
        {
          model: Comment,
          where: { taskinfoId: taskInfo.id },
        },
      ],
    });
    let checkLists = await Taskinfo.findOne({
      include: [
        {
          model: CheckList,
          where: { taskinfoId: taskInfo.id },
        },
      ],
    });
    if (checkLists) {
      checkLists = await Promise.all(
        checkLists.checkLists.map(async (item) => {
          let todo = await Todo.findAll({
            where: {
              checkListId: item.id,
            },
          });
          item.dataValues.todo = todo ? todo : [];
          return item;
        })
      );
    } else {
      checkLists = [];
    }
    let labels = await Labels.findAll({
      order: [["index", "ASC"]],
      include: [{ model: Task, where: { id: taskInfo.taskId } }],
    });
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    comments = comments ? comments.comments : [];

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
        labels,
        checkLists,
      });
    } else {
      return response.status(401).send("Unauthorized");
    }
  },

  updateTaskName: async (request, response) => {
    const { token, id, name } = request.body;
    const taskInfo = await Taskinfo.update(
      {
        name,
      },
      {
        where: {
          taskId: id,
        },
      }
    );
    const task = await Task.update(
      {
        name,
      },
      {
        where: {
          id,
        },
      }
    );
    return response.status(200).send({ taskInfo });
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
    console.log(taskInfo);
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

  addLabel: async (request, response) => {
    try {
      const { token, labelId, taskId, dashboardId } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const label = await Labels.findOne({
          where: {
            index: labelId,
            dashboardId,
          },
        });
        const task = await Task.findOne({
          where: {
            id: taskId,
          },
        });

        if (label && task) {
          await task.addLabel(label);

          Labels.findAll({
            include: [{ model: Task, where: { id: task.id } }],
          }).then((labels) => {
            return response.status(201).send({ labels });
          });
        } else {
          return response.status(400).send("No dashboards created");
        }
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      console.log(error);
      return response.status(500).send("Error token");
    }
  },

  deleteLabel: async (request, response) => {
    try {
      const { token, labelId, taskId, dashboardId } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const task = await Task.findOne({
          where: {
            id: taskId,
          },
        });
        const label = await Labels.findOne({
          where: {
            index: labelId,
            dashboardId,
          },
        });
        task.removeLabel(label);
        return response.status(201).send({ result: true });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      return response.status(500).send("Error token");
    }
  },

  getLabels: async (request, response) => {
    try {
      const { token, boardId } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const labelsInfo = Labels.findAll({
          include: [
            {
              model: Dashboard,
              order: [["index", "ASC"]],
              where: { id: boardId },
            },
          ],
        });
        return response.status(201).send({ labelsInfo });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      return response.status(500).send("Error token");
    }
  },

  getLabel: async (request, response) => {
    try {
      let { token, dashboardId } = request.body;
      const { id } = request.params;

      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const labels = await Labels.findAll({
          order: [["index", "ASC"]],
          include: [{ model: Task, where: { id } }],
          where: {
            dashboardId,
          },
        });
        return response.status(201).send(labels);
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      console.log(error);
      return response.status(500).send("Error token");
    }
  },

  updateLabel: async (request, response) => {
    try {
      const { token, id, text, dashboardId } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const labelInfo = await Labels.update(
          {
            text,
          },
          {
            where: {
              index: id,
              dashboardId,
            },
          }
        );
        return response.status(201).send({ labelInfo });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      return response.status(500).send("Error token");
    }
  },

  createCheckList: async (request, response) => {
    try {
      const { token, id, name } = request.body;

      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const taskInfo = await Taskinfo.findOne({
          where: {
            id,
          },
        });
        const checkList = await CheckList.create({ name });
        await taskInfo.addCheckList(checkList);
        return response.status(201).send({ checkList });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (e) {
      console.log(e);
      return response.status(500).send("Error server");
    }
  },

  updateCheckList: async (request, response) => {
    const { token, id, name } = request.body;
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    if (userId) {
      const todo = await CheckList.update(
        {
          name,
        },
        {
          where: {
            id,
          },
        }
      );
      return response.status(201).send({ todo });
    } else {
      return response.status(401).send("Unauthorized");
    }
  },

  deleteCheckList: async (request, response) => {
    const { token, id } = request.body;
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    if (userId) {
      Todo.destroy({
        where: {
          checkListId: id,
        },
      });
      const checkList = await CheckList.destroy({
        where: {
          id,
        },
      });

      return response.status(201).send({ checkList });
    } else {
      return response.status(401).send("Unauthorized");
    }
  },

  createTodo: async (request, response) => {
    try {
      const { token, id, text } = request.body;
      const userId = jwt.verify(token, process.env.JWT_SECRET).id;
      if (userId) {
        const checkList = await CheckList.findOne({
          where: {
            id,
          },
        });
        const todo = await Todo.create({
          checked: false,
          text,
        });
        await checkList.addTodo(todo);
        return response.status(201).send({ todo });
      } else {
        return response.status(401).send("Unauthorized");
      }
    } catch (error) {
      console.log(error);
      return response.status(500).send("Error token");
    }
  },

  updateTodo: async (request, response) => {
    const { token, id, text, checked } = request.body;
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    if (userId) {
      const todo = await Todo.update(
        {
          checked,
          text,
        },
        {
          where: {
            id,
          },
        }
      );
      return response.status(201).send({ todo });
    } else {
      return response.status(401).send("Unauthorized");
    }
  },

  deleteTodo: async (request, response) => {
    const { token, id } = request.body;
    const userId = jwt.verify(token, process.env.JWT_SECRET).id;
    if (userId) {
      const todo = await Todo.destroy({
        where: {
          id,
        },
      });
      return response.status(201).send({ todo });
    } else {
      return response.status(401).send("Unauthorized");
    }
  },
};

const controllerAuth = {
  google: async (request, response) => {
    const data = response.req.user._json;
    let user = await User.findOne({
      where: {
        email: data.email,
      },
    });
    if (!user) {
      const dataUser = {
        userName: data.name,
        email: data.email,
        password: await bcrypt.hash(data.sub, 10),
        color: "rgb(0, 101, 255)",
      };
      user = await User.create(dataUser);
    }

    let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: EXPIRES_IN,
    });
    response.redirect(`http://localhost:8080/#token=${token}`);
    return;
  },
};
module.exports = {
  controllerUser,
  controllerDashboard,
  controllerTaskList,
  controllerTask,
  controllerAuth,
  createIO,
};
