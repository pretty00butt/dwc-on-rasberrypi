const usersService = require("../database/users.service");

const userCache = {};

exports.getAllUsersInfo = async () => {
  let users = null;
  try {
    users = await usersService.find();
    if (!users) return [];
  } catch (e) {
    console.error("Error in fetching all users", e);
  }

  return users;
};

exports.isUserAdmin = async (id) => {
  let userData = null;
  try {
    userData = await usersService.findById(id);
    if (userData.role.name == "admin") return true;
  } catch (e) {
    console.error("Failed to retrieve user by id", id, e);
    return false;
  }

  return false;
};
