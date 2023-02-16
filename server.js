const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./models");
const routes = require("./routes/routes");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app, cors());
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

db.sequelize.sync({ force: false }).then(() => {
  console.log("db has been re sync");
});

io.on("connection", (socket) => {
  console.log("a user connected " + socket.id);
  socket.on('message', (data)=>{
    console.log(data);
    socket.broadcast.emit('answer', data);
  })
});

app.use("/api", routes);

server.listen(PORT, () => console.log(`Server is connected on ${PORT}`));
