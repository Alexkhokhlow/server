const bcrypt = require("bcrypt");
const db = require("../models");
const jwt = require("jsonwebtoken");

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
      return response.status(201).send();
    } else {
      return response.status(409).send("Details are not correct");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  signup,
};
