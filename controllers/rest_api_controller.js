const { v4: uuidv4 } = require("uuid");
const Video = require("../models/video");
const User = require("../models/user");
const getUserDataFromJWT = require("../utility/getUserFromToken");
const logError = require("../utility/logError");
const QUOTESERVER = require("../models/quote_server");

const getModel = type => {
  if (type !== "video" && type !== "user" && type !== "quoteserver") {
    return false;
  }
  const modelEnum = {
    video: Video,
    user: User,
    quoteserver: QUOTESERVER,
  };
  return modelEnum[type];
};

const recordsRetriever = async (Model, id) => {
  if (!Model) {
    throw new Error(
      "Can't retrieve the record. Please check the type parameter",
    );
  }
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
      return res.status(403).json({ err: "Token wrong", success: false });
    }
    const { properties } = req.body;
    const Model = getModel(req.params.object);
    console.log(properties);
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
      return res.status(403).json({ err: "Token wrong", success: false });
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
      return res.status(403).json({ err: "Token wrong", success: false });
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
      return res.status(403).json({ err: "Token wrong", success: false });
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
      return res.status(403).json({ err: "Token wrong", success: false });
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

// I am not sure if you wanted jwt token check in this one
exports.getVideos = async (req, res) => {
  try {
    const videos = await Video.findAll({
      where: {
        isEnabled: true,
      },
      order: [["CREATED_DT", "DESC"]], // spec says to display most recent first, with incremental id, this will work
    });
    console.log(videos);
    return res.status(200).json({ msg: "Success", success: true, videos });
  } catch (err) {
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};
