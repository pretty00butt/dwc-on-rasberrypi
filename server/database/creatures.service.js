const axios = require("axios");
const config = require("./config");

exports.save = async function (creature) {
  const result = await axios({
    method: "post",
    url: `${config.apiHost}/creatures`,
    data: creature,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};

exports.find = async function (where) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/creatures/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data.rows;
};

exports.findOne = async function (where) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/creatures/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  if (result.data && result.data.rows && result.data.rows.length) {
    return {
      row: result.data.rows[0],
    };
  }

  return {
    row: null,
  };
};

exports.findOneByUid = async function (where) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/creatures/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  if (result.data && result.data.rows && result.data.rows.length) {
    return {
      row: result.data.rows[0],
    };
  }

  return {
    row: null,
  };
};

exports.findById = async function (id) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/creatures/${id}`,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};

exports.update = async function (id, data) {
  data.user = undefined;
  data.owner = undefined;

  const result = await axios({
    method: "put",
    url: `${config.apiHost}/creatures/${id}`,
    data,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};
