const db = require("../models");
const express = require("express");

const User = db.users;

const saveUser = async (req, res, next) => {
  try {
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
    return res.status(500).send("Error server");
  }
};

module.exports = {
  saveUser,
};
