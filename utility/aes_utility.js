const crypto = require("crypto");

const algorithm = "aes-256-ctr";

exports.encrypt = text => {
  const cipher = crypto.createCipher(algorithm, process.env.aesPwd);
  let crypted = cipher.update(text, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};

exports.decrypt = text => {
  const decipher = crypto.createDecipher(algorithm, process.env.aesPwd);
  let dec = decipher.update(text, "hex", "utf8");
  dec += decipher.final("utf8");
  return dec;
};
