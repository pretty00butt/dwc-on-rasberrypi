const axios = require("axios");
const config = require("./config");

function convertDwcToWorkers(garden) {
  return {
    ...garden,
    neighbors: undefined,
    tileProps: undefined,
    shaderProps: undefined,
    top: garden.neighbors.top,
    top_garden_id: garden.neighbors.top_id,
    bottom: garden.neighbors.bottom,
    bottom_garden_id: garden.neighbors.bottom_id,
    right: garden.neighbors.right,
    right_garden_id: garden.neighbors.right_id,
    left: garden.neighbors.left,
    left_garden_id: garden.neighbors.left_id,
    props: {
      tiles: garden.tileProps,
      shader: garden.shaderProps,
    },
  };
}

function convertWorkersToDwc(garden) {
  return {
    ...garden,
    neighbors: {
      top_id: garden.top_garden_id,
      top: garden.top_garden,
      bottom_id: garden.bottom_garden_id,
      bottom: garden.bottom,
      right_id: garden.right_garden_id,
      right: garden.right,
      left_id: garden.left_garden_id,
      left: garden.left,
    },
    tileProps: garden.props.tiles,
    shaderProps: garden.props.shader,
  };
}

exports.save = async function (garden) {
  const result = await axios({
    method: "post",
    url: `${config.apiHost}/garden-sections`,
    data: convertDwcToWorkers(garden),
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return {
    row: convertWorkersToDwc(result.data),
  };
};

exports.find = async function (where) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/garden-sections/all`,
    params: where,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return {
    ...result.data,
    rows: result.data.rows.map(convertWorkersToDwc),
  };
};

exports.findById = async function (id) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/garden-sections/${id}`,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return {
    ...result.data,
    row: convertWorkersToDwc(result.data.row),
  };
};

exports.findOne = async function ({ where }) {
  const result = await axios({
    method: "get",
    url: `${config.apiHost}/garden-sections/all`,
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

  return { row: null };
};

exports.update = async function (id, data) {
  const result = await axios({
    method: "put",
    url: `${config.apiHost}/garden-sections/${id}`,
    data,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};

exports.remove = async function (id) {
  const result = await axios({
    method: "delete",
    url: `${config.apiHost}/garden-sections/${id}`,
  });

  if (result.data.error) {
    throw new Error(result.data.error);
  }

  return result.data;
};
