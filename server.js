const express = require("express");
const cookieParser = require("cookie-parser");
const db = require("./models");
const routes = require("./routes/routes");
const cors = require("cors");
const http = require("http");
const app = express();
const server = http.createServer(app, cors());
const passport = require("passport");

const session = require('express-session');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:8080",
    methods: ["GET", "POST"],
  },
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
  socket.on("message", (data) => {
    console.log(data);
    socket.broadcast.emit("answer", data);
  });
});

app.use("/api", routes);

app.use(passport.initialize());
app.use(passport.session());

server.listen(PORT, () => console.log(`Server is connected on ${PORT}`));

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/error" }),
  (request, response) => {
    return response.status(201).send({ response });
  },
);


passport.use(cors());
var GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const GOOGLE_CLIENT_ID =
  "9479350765-89gr5t1rpmpd9ao2h4gl0udgu3fntlb5.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = "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";

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    function (accessToken, refreshToken, profile, done) {
      userProfile = profile;
      return done(null, userProfile);
    }
  )
);
