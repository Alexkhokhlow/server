const { Sequelize, DataTypes } = require("sequelize");


// for server
// const sequelize = new Sequelize(
//   `postgres://db_0v4n_user:FOLSvtQu3GtoQfcQDbSk9nLz4Phyi1Yc@dpg-cfh05582i3mp5ru4fd8g-a/db_0v4n`,
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
db.users.hasMany(db.dashboard);
db.users.belongsToMany(db.dashboard, {through: "user_dashboard"});
db.dashboard.belongsToMany(db.users, {through: "user_dashboard"});

module.exports = db;
