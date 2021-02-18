const jwt = require("jsonwebtoken");
const User = require("../models/user");

const getUserDataFromJWT = async token => {
  const decodedUserToken = await jwt.verify(token, process.env.JWT_TOKEN);
  const { id } = decodedUserToken.data;
  console.log(decodedUserToken);
  const adminUser = await User.findByPk(id);
  console.log(adminUser);
  if (!adminUser) {
    return false;
  }
  return adminUser;
};

module.exports = getUserDataFromJWT;
