const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./models");
const routes = require("./routes/routes");
const cors = require("cors");

const PORT = process.env.PORT || 8081;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

db.sequelize.sync({ force: false }).then(() => {
  console.log("db has been re sync");
});

app.use("/api", routes);

app.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
