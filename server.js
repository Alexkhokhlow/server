const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./models");
const routes = require("./routes/routes");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app, cors());
require('./controllers/controllers').createIO(server)

const session = require("express-session");
const { Model } = require("sequelize");

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

db.sequelize.sync({ force: false }).then(() => {
  console.log("db has been re sync");
});

app.use("/api", routes);

server.listen(PORT, () => console.log(`Server is connected on ${PORT}`));

module.exports = server;