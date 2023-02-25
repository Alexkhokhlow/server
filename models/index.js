const { Sequelize, DataTypes } = require("sequelize");

// // for server
const sequelize = new Sequelize(
  "postgres://trello_9u58_user:7CcliEIcj5DvF2FlhIjDNQWy7Xmtv1lO@dpg-cft0db2rrk0c833lp8fg-a/trello_9u58",
  { dialect: "postgres" }
);

// for local
// const sequelize = new Sequelize(
//   `postgres://postgres:Edelweis1@localhost:5432/postgres`,
//   { dialect: "postgres" }
// );

sequelize
  .authenticate()
  .then(() => {
    console.log(`Database connected to discover`);
  })
  .catch((err) => {
    console.log(err);
  });

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./userModel")(sequelize, DataTypes).User;
db.dashboard = require("./dashboardModel")(sequelize, DataTypes).DashBoard;
db.tasklist = require("./taskListModel")(sequelize, DataTypes).Tasklist;
db.task = require("./taskModel")(sequelize, DataTypes).Task;
db.taskinfo = require("./taskInfoModel")(sequelize, DataTypes).Taskinfo;
db.comment = require("./commentModel")(sequelize, DataTypes).Comment;
db.labels = require("./labelModel")(sequelize, DataTypes).Labels;
db.taskLabel = require("./taskLabelModel")(sequelize, DataTypes).TaskLabel;
db.checkList = require("./checkListModel")(sequelize, DataTypes).CheckList;
db.todo = require("./todoModel")(sequelize, DataTypes).Todo;


db.users.hasMany(db.dashboard);

db.dashboard.hasMany(db.tasklist, {
  foreignKey: "dashboardId",
});
db.tasklist.belongsTo(db.dashboard, {
  foreignKey: "dashboardId",
});

db.tasklist.hasMany(db.task, {
  foreignKey: "taskListId",
});
db.task.belongsTo(db.tasklist, {
  foreignKey: "taskListId",
});

db.taskinfo.hasMany(db.comment);
db.comment.belongsTo(db.taskinfo);

db.taskinfo.hasMany(db.checkList);
db.checkList.belongsTo(db.taskinfo);

db.checkList.hasMany(db.todo);
db.todo.belongsTo(db.checkList);

db.task.belongsToMany(db.labels, { through: db.taskLabel });
db.labels.belongsToMany(db.task, { through: db.taskLabel, uniqueKey: "index" });

db.users.belongsToMany(db.dashboard, { through: "user_dashboard" });
db.dashboard.belongsToMany(db.users, { through: "user_dashboard" });

module.exports = db;
