const authService = require("../database/auth.service");
const usersService = require("../database/users.service");
const gardenController = require("./garden.controller");
const creatureController = require("./creature.controller");

exports.signup = async (req, res) => {
  try {
    const { row: savedUser } = await usersService.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
    });

    const garden = await gardenController.createGardenSection();
    if (garden) {
      savedUser.garden_section_id = garden.id;
    } else {
      res.status(500).send({ message: "Failed to create garden for user" });
    }

    const creature = await creatureController.createCreature(garden, savedUser);
    savedUser.creature_id = creature.id;

    await usersService.update(savedUser.id, savedUser);
  } catch (e) {
    console.error("Caught exception in sign up: ", e);
    res.status(500).send({ message: e });
    return;
  }

  res.status(200).send({ message: "User was registered successfully!" });
};

// NOTE:
// @ 22.10.16:
// - error handling on client size
exports.signin = async (req, res) => {
  const { user, gardenSection, accessToken } = await authService.signIn({ username: req.body.username });
  res.status(200).send(
    result || {
      id: user.id,
      username: user.username,
      email: user.email,
      role: [`ROLE_${user.role.name.toUpperCase()}`],
      gardenSection: gardenSection,
      accessToken,
    }
  );
};
