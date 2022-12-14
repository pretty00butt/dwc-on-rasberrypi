const TYPES = require("../datatypes");

module.exports = class User {
  constructor(props) {
    this.gardenSection = null;
    this.creature = null;
    this.is_online = null;

    Object.keys(props).forEach((key) => {
      if (!key in this) {
        console.warn("Appending a key not defined in the User schema", key);
      }
      this[key] = props[key];
    });
  }
};
