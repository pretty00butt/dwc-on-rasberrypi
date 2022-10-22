const creatureController = require("./creature.controller");
const gardenController = require("./garden.controller");

const usersService = require("../database/users.service");

const socketMap = {};
const socketIdToUserId = {};
const gardenForUidCache = {};

let animationTimeout;
let io = null;

exports.initialize = (ioInstance) => {
  io = ioInstance;
};

exports.userConnected = async (socket) => {
  const uid = socket.handshake.query.uid;
  const creatureName = socket.handshake.query.creatureName;
  // const newCreatureName = creatureName;
  socketIdToUserId[socket.id] = uid;
  socketMap[uid] = socket;

  socket.on("disconnect", onDisconnect(socket));
  socket.on("adminConnect", onAdminConnect(socket));
  socket.on("creatureEvolve", onCreatureEvolve(socket));
  socket.on("gardenTap", onGardenTap(socket));

  // Get or create user for the given uid
  console.log("Fetching user from DB: ", uid);
  let user = await usersService.findByUid(uid);
  if (!user) {
    // TODO: creatureName?
    await usersService.create({ uid, creatureName });
  }

  user.creatureName = creatureName;

  await gardenController.clearGardenSection(uid);
  const garden = await gardenController.createGardenSection(uid);

  if (garden) {
    user.garden_section_id = garden.id;
    await usersService.update(user.id, user);
    gardenForUidCache[uid] = garden;
  } else {
    console.error("Failed to create garden section for user");
  }

  let creature = await creatureController.getCreatureForUser(user.id);
  if (creature) {
    await creatureController.moveCreatureToGarden(creature, garden);
  } else {
    creature = await creatureController.createCreature(garden, user);
    user.creature = creature.id;
    await usersService.update(user.id, user);
  }

  await creatureController.bringCreatureOnline(creature);

  io.emit("usersUpdate", await getOnlineUsers());

  const creatures = await getAllCreatures();
  const creaturesString = JSON.stringify(creatures, (key, val) => {
    return val && val.toFixed ? Number(val.toFixed(3)) : val;
  });
  io.emit("creatures", creaturesString);
};

const onAdminConnect = (socket) => async (reason) => {
  console.log("on admin connect");
  io.emit("adminConnectBroadcast", {});
};

const creatureEvolveTimestamps = {};

const onCreatureEvolve = (socket) => async (data) => {
  console.log("on creature evolve: ", data._id);
  const now = new Date().getTime();
  if (creatureEvolveTimestamps[data.id] && now - creatureEvolveTimestamps[data.id] < 2000) return;

  await creatureController.evolveCreature(data._id);

  creatureEvolveTimestamps[data.id] = now;
  io.emit("creatureEvolveBroadcast", data);
};

onGardenTap = (socket) => async (data) => {
  const uid = socketIdToUserId[socket.id];
  const user = await usersService.findByUid(uid);
  let updates = await creatureController.updateSingleCreatureForTap(user, data);
  io.emit("creaturesUpdate", updates);
};

const onDisconnect = (socket) => async (reason) => {
  console.log("on disconnect: ", socket.id);
  const uid = socketIdToUserId[socket.id];

  delete socketIdToUserId[socket.id];
  delete socketMap[uid];
  delete gardenForUidCache[uid];

  await gardenController.clearGardenSection(uid);
  await creatureController.bringCreatureOffline(uid);

  const { rows: onlineUsers } = await getOnlineUsers();

  io.emit("usersUpdate", onlineUsers);

  const creatures = await getAllCreatures();

  const creaturesString = JSON.stringify(creatures, (key, val) => {
    return val && val.toFixed ? Number(val.toFixed(3)) : val;
  });

  io.emit("creatures", creaturesString);
};

const getOnlineUsers = () => {
  console.log("get online users: ", Object.keys(socketMap));
  return Promise.all(Object.keys(socketMap).map((uid) => usersService.findByUid(uid)));
};

const getAllCreatures = async () => {
  const { rows: creatures } = await creatureController.getAllCreaturesInfo();
  return creatures;
};

exports.startAnimatingCreatures = async () => {
  allCreatures = (await getAllCreatures()).reduce((acc, el) => {
    acc[el.id] = el;
    return acc;
  }, {});

  animationTimeout = setInterval(async () => {
    const onlineUsers = Object.keys(socketMap);
    let updated = await creatureController.updateCreatures(onlineUsers, gardenForUidCache);
    if (Object.keys(updated).length > 0) io.emit("creaturesUpdate", updated);
  }, 1000);
};
