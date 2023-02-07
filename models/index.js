const { Sequelize, DataTypes } = require("sequelize");


// for server
const sequelize = new Sequelize(
  `postgres://db_0v4n_user:FOLSvtQu3GtoQfcQDbSk9nLz4Phyi1Yc@dpg-cfh05582i3mp5ru4fd8g-a.frankfurt-postgres.render.com/db_0v4n`,
  { dialect: "postgres" }
);

//for local
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

tables = require("./userModel")(sequelize, DataTypes);
db.users = tables.User;

module.exports = db;
