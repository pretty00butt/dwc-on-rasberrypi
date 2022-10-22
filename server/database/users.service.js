const axios = require("axios");
const config = require("./config");

exports.create = async function (user) {
  const result = await axios({
    method: "post",
    url: `${config.apiHost}/users`,
    data: user,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};

exports.find = async function ({ where }) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/users/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  if (result.data && result.data.rows) {
    return result.data.rows;
  }

  return [];
};

exports.findById = async function (id) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/users/${id}`,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};

exports.findByUid = async function (uid) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/users/by-uid/${uid}`,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};

exports.findOne = async function ({ where }) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/users/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  if (result.data && result.data.rows && result.data.rows.length) {
    return result.data.rows[0];
  }

  return null;
};

exports.update = async function (id, data) {
  const result = await axios({
    method: "put",
    url: `${config.apiHost}/users/${id}`,
    data,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};
