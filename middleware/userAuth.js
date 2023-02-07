const db = require("../models");
const express = require("express");

const User = db.users;

const saveUser = async (req, res, next) => {
  try {
    const username = await User.findOne({
      where: {
        userName: req.body.userName,
      },
    });
    if (username) {
      return res.status(400).send("User with this name exists");
    }
    const emailcheck = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (emailcheck) {
      return res.status(400).send("User with this email exists");
    }

    next();
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  saveUser,
};
