const usersService = require("../database/users.service");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = async (req, res) => {
  const { rows: users } = await usersService.find();
  console.log("Users: ", users);
  res.status(200).send(users);
};
