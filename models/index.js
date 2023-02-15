const { Sequelize, DataTypes } = require("sequelize");

// for server
// const sequelize = new Sequelize(
//   `postgres://trello_wj2v_user:64MDu3RwNfx1LRsBvw5ELlKZQWtDxMxM@dpg-cfmburcgqg469kthjnr0-a/trello_wj2v`,
//   { dialect: "postgres" }
// );

// for local
const sequelize = new Sequelize(
  `postgres://postgres:Edelweis1@localhost:5432/postgres`,
  { dialect: "postgres" }
);

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

db.users.belongsToMany(db.dashboard, { through: "user_dashboard" });
db.dashboard.belongsToMany(db.users, { through: "user_dashboard" });

module.exports = db;
