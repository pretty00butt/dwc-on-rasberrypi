const axios = require("axios");
const config = require("./config");

exports.signIn = async function ({ username, password }) {
  const result = await axios({
    method: "post",
    url: `${config.apiHost}/auth/signin`,
    data: {
      username,
      password,
    },
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};
