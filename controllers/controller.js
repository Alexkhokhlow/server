const bcrypt = require("bcrypt");
const db = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const EXPIRES_IN = "5d";

const User = db.users;

const signup = async (request, response) => {
  try {
    const { userName, email, password } = request.body;

    const data = {
      userName,
      email,
      password: await bcrypt.hash(password, 10),
    };
    const user = await User.create(data);
    if (user) {
      // let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      //   expiresIn: process.env.JWT_EXPIRES_IN,
      // });
      // return res.status(201).send(token);
      return response.status(201).send({userName, email});
    } else {
      return response.status(400).send();
    }
  } catch (error) {
    console.log("4");
    console.log(error);
  }
};

const login = async (request, response) => {
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
        return response.status(200).json({token});
      } else {
        return response.status(400).send("Authentication failed");
      }
    }
    return response.status(400).send("Authentication failed");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signup,
  login,
};
