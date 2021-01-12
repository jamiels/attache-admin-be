const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const Video = require("../models/video");
const User = require("../models/user");

const getUserDataFromJWT = async token => {
  const decodedUserToken = await jwt.verify(token, process.env.JWT_TOKEN);
  const { id, login } = decodedUserToken.data;
  console.log(decodedUserToken);
  const adminUser = await User.findByPk(id);
  console.log(adminUser);
  if (!adminUser) {
    return false;
  }
  return adminUser;
};

const getModel = type => {
  if (type !== "video" && type !== "user") {
    throw new Error("Wrong type parameter");
  }
  const modelEnum = {
    video: Video,
    user: User,
  };
  return modelEnum[type];
};

const logError = err => {
  console.warn(err.message);
  console.warn(err.stack);
};

const recordsRetriever = async (Model, id) => {
  const record = await Model.findByPk(id);
  if (!record) {
    throw new Error("Can't retrieve the record. Please check id");
  }
  return record;
};

exports.create = async (req, res) => {
  try {
    const adminUser = await getUserDataFromJWT(req.token);
    if (!adminUser) {
      return res.status(401).json({ err: "Token wrong", success: false });
    }
    const { properties } = req.body;
    const Model = getModel(req.params.object);
    const newRecord = await Model.create({
      ...properties,
    });
    return res
      .status(201)
      .json({ msg: "Success", success: true, created: newRecord });
  } catch (err) {
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};

exports.retrieveAll = async (req, res) => {
  try {
    const adminUser = await getUserDataFromJWT(req.token);
    if (!adminUser) {
      return res.status(401).json({ err: "Token wrong", success: false });
    }
    const Model = getModel(req.params.object);
    const records = await Model.findAll();
    return res.status(200).json({ msg: "Success", success: true, records });
  } catch (err) {
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};

exports.retrieve = async (req, res) => {
  try {
    const checkToken = await getUserDataFromJWT(req.token);
    if (!checkToken) {
      return res.status(401).json({ err: "Token wrong", success: false });
    }
    // eslint-disable-next-line
    let { object, id } = req.params;
    if (!id) {
      id = req.body.id;
    }
    const record = await recordsRetriever(getModel(object), id);
    return res.status(200).json({ msg: "Success", success: true, record });
  } catch (err) {
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};

exports.delete = async (req, res) => {
  try {
    const checkToken = await getUserDataFromJWT(req.token);
    if (!checkToken) {
      return res.status(401).json({ err: "Token wrong", success: false });
    }
    const { object, id } = req.params;
    const record = await recordsRetriever(getModel(object), id);
    await record.destroy();
    return res.status(200).json({ msg: "Success", success: true });
  } catch (err) {
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};

exports.edit = async (req, res) => {
  try {
    const checkToken = await getUserDataFromJWT(req.token);
    if (!checkToken) {
      return res.status(401).json({ err: "Token wrong", success: false });
    }
    const { properties } = req.body;
    const { object, id } = req.params;
    const record = await recordsRetriever(getModel(object), id);
    // eslint-disable-next-line
    Object.entries(properties).forEach(([key, value]) => (record[key] = value));
    await record.save();
    // const updatedRecord = {...record, properties};
    return res.status(200).json({ msg: "Success", success: true, record });
  } catch (err) {
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};
