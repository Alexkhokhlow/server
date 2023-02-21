const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./models");
const routes = require("./routes/routes");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app, cors());

const session = require("express-session");

app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: "SECRET",
  })
);

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

db.sequelize.sync({ force: false }).then(() => {
  console.log("db has been re sync");
});

io.on("connection", (socket) => {
  socket.on("board", (data) => {
    socket.broadcast.emit("board", data);
  });
  socket.on("label", (data) => {
    io.sockets.emit("board", data);
    io.sockets.emit("label", data);
  });
  socket.on("taskInfo", (data) => {
    io.sockets.emit("board", data);
    socket.broadcast.emit("taskInfo", data);
  });
});

app.use("/api", routes);

server.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
