const shuffle = require("lodash.shuffle");
const constants = require("../constants");
const { randomElementFromArray, randomIntInRange } = require("../utils");
const { DWC_META } = require("../../shared-constants");
const { getConfig } = require("../config.js");

const gardenService = require("../database/garden.service");
const usersService = require("../database/users.service");

exports.createGardenSection = async (user) => {
  let gardenSection;

  // Start from an arbitrary garden section
  try {
    let { rows: gardenSections } = await gardenService.find({ x: 0, y: 0 });

    if (gardenSections && gardenSections.length > 0) {
      gardenSection = gardenSections[Math.floor(Math.random() * gardenSections.length)];
    }
  } catch (e) {
    console.error("Caught error in getting arbitrary garden section: ", e);
  }

  let newGarden = null;

  // If the query didn't return any results, it means there are no gardens in the database, so we create the first one.
  if (!gardenSection || gardenSection.length == 0) {
    newGarden = {
      x: 0,
      y: 0,
      width: constants.GARDEN_WIDTH,
      height: constants.GARDEN_HEIGHT,
      neighbors: {
        top_id: null,
        bottom_id: null,
        right_id: null,
        left_id: null,
      },
    };
  } else {
    // We do a "random" walk until we find an empty spot
    let visited = {};
    console.log("debug-garden: ", gardenSection);
    while (!newGarden) {
      visited[gardenSection.id] = true;

      let sKeys = Object.keys(gardenSection.neighbors);
      sKeys = shuffle(sKeys);

      // Find a neighbor that's not allocated
      let emptyNeighborKey = null;
      for (let key of sKeys) {
        if (!gardenSection.neighbors[key]) {
          emptyNeighborKey = key;
        } else {
          const result = await gardenService.findById(gardenSection.neighbors[key]);
          if (!result.row) emptyNeighborKey = key;
        }
      }

      if (!emptyNeighborKey) {
        // If all neighbors are busy, keep going to one that wasn't visited.
        let nextId;
        for (let key of sKeys) {
          console.log("Checking for ", key, " ", gardenSection.neighbors[key]);
          if (!visited[gardenSection.neighbors[key]]) nextId = gardenSection.neighbors[key];
        }

        try {
          gardenSection = await gardenService.findById(nextId);
        } catch (e) {
          console.error(e);
          return null;
        }
      } else {
        // If we found one free neighbor, create a garden
        switch (emptyNeighborKey) {
          case "top":
            newGarden = {
              x: gardenSection.x,
              y: gardenSection.y - constants.GARDEN_HEIGHT,
              width: constants.GARDEN_WIDTH,
              height: constants.GARDEN_HEIGHT,
              neighbors: {
                top_id: null,
                bottom_id: null,
                right_id: null,
                left_id: null,
              },
            };
            break;
          case "right":
            newGarden = {
              x: gardenSection.x + constants.GARDEN_WIDTH,
              y: gardenSection.y,
              width: constants.GARDEN_WIDTH,
              height: constants.GARDEN_HEIGHT,
              neighbors: {
                top_id: null,
                bottom_id: null,
                right_id: null,
                left_id: null,
              },
            };
            break;
          case "bottom":
            newGarden = {
              x: gardenSection.x,
              y: gardenSection.y + constants.GARDEN_HEIGHT,
              width: constants.GARDEN_WIDTH,
              height: constants.GARDEN_HEIGHT,
              neighbors: {
                top_id: null,
                bottom_id: null,
                right_id: null,
                left_id: null,
              },
            };
            break;
          case "left":
            newGarden = {
              x: gardenSection.x - constants.GARDEN_WIDTH,
              y: gardenSection.y,
              width: constants.GARDEN_WIDTH,
              height: constants.GARDEN_HEIGHT,
              neighbors: {
                top_id: null,
                bottom_id: null,
                right_id: null,
                left_id: null,
              },
            };
            break;
        }
      }
    }
  }

  // Set up animation properties
  const noTiles = 4;
  const stepsPerTile = 5;

  newGarden.tileProps = [];
  for (let i = 0; i < noTiles; i++) {
    const currTile = [];
    for (let j = 0; j < stepsPerTile; j++) {
      const shapeTypes = getConfig().backgroundTypes;
      const shape = randomElementFromArray(shapeTypes);
      const target =
        shape == DWC_META.tileShapes.TRIANGLE
          ? randomElementFromArray([0.25, 0.4, 0.5, 0.6, 0.75])
          : randomElementFromArray([0.25, 0.3, 0.4, 0.75]);
      currTile.push({
        target: target,
        duration: randomIntInRange(25000, 75000),
        shape: shape,
        anchor: randomElementFromArray([0, 1, 2, 3]),
      });
    }

    newGarden.tileProps.push(currTile);
  }

  newGarden.shaderProps = {
    shaderTimeSeed: Math.random() * 10,
    shaderSpeed: Math.random() * 10 + 1,
  };

  newGarden.userId = user.id;

  let garden;

  try {
    garden = await gardenService.save(newGarden);
  } catch (e) {
    console.error("Exception in trying to save garden: ", e);
    return null;
  }

  try {
    const { row: nTop } = await gardenService.findOne({
      x: newGarden.x,
      y: newGarden.y - constants.GARDEN_HEIGHT,
    });
    if (nTop) {
      nTop.neighbors.bottom_id = garden.id;
      garden.neighbors.top_id = nTop.id;
      await gardenService.update(nTop.id, nTop);
    }

    const { row: nRight } = await gardenService.findOne({
      x: newGarden.x + constants.GARDEN_WIDTH,
      y: newGarden.y,
    });
    if (nRight) {
      nRight.neighbors.left_id = garden.id;
      garden.neighbors.right_id = nRight.id;
      await gardenService.update(nRight.id, nRight);
    }

    const { row: nBottom } = await gardenService.findOne({
      x: newGarden.x,
      y: newGarden.y + constants.GARDEN_HEIGHT,
    });
    if (nBottom) {
      nBottom.neighbors.top_id = garden.id;
      garden.neighbors.bottom_id = nBottom.id;
      await gardenService.update(nBottom.id, nBottom);
    }

    const { row: nLeft } = await gardenService.findOne({
      x: newGarden.x - constants.GARDEN_WIDTH,
      y: newGarden.y,
    });
    if (nLeft) {
      nLeft.neighbors.right_id = garden.id;
      garden.neighbors.left_id = nLeft.id;
      await gardenService.update(nLeft.id, nLeft);
    }

    await gardenService.update(garden.id, garden);
  } catch (e) {
    console.error("Caught exception in creating neighbors for garden: ", e);
    return null;
  }

  return garden;
};

exports.clearGardenSection = async (uid) => {
  const { row: user } = await usersService.findByUid({ uid });
  if (!user) return;
  const garden = await gardenService.findOne({ user_id: user.id });
  if (!garden) return;

  const nTop = garden.neighbors.top;
  if (nTop) {
    await gardenService.update(nTop.id, {
      ...nTop,
      neighbors: {
        ...garden.neighbors,
        bottom: null,
        bottom_id: null,
      },
    });
  }

  const nRight = garden.neighbors.right;
  if (nRight) {
    await gardenService.update(nRight.id, {
      ...nTop,
      neighbors: {
        ...garden.neighbors,
        left: null,
        left_id: null,
      },
    });
  }

  const nBottom = garden.neighbors.bottom;
  if (nBottom) {
    await gardenService.update(nBottom.id, {
      ...nTop,
      neighbors: {
        ...garden.neighbors,
        top: null,
        top_id: null,
      },
    });
  }

  const nLeft = garden.neighbors.left;
  if (nLeft) {
    await gardenService.update(nLeft.id, {
      ...nTop,
      neighbors: {
        ...garden.neighbors,
        right: null,
        right_id: null,
      },
    });
  }

  await usersService.update(id, { garden_section_id: null });
  await gardenService.remove(garden.id);

  console.warn("clearGardenSection for user", uid);
};
