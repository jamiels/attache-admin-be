const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const { salt } = process.env;
const salt = bcrypt.genSaltSync(10);
exports.register = async (req, res) => {
  console.log(req.body);
  try {
    const checkUsername = await User.findOne({
      where: {
        login: req.body.login,
      },
    });
    if (checkUsername) {
      return res
        .status(409)
        .json({ err: "Login already taken", success: false }); // maybe 422?
    }

    const hashedPass = await bcrypt.hash(req.body.password, salt);
    const newUserAccount = await User.create({
      id: uuidv4(),
      login: req.body.login,
      password: hashedPass,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
    const payload = {
      id: newUserAccount.id,
      login: newUserAccount.login,
    };
    const token = jwt.sign({ data: payload }, process.env.JWT_TOKEN, {
      expiresIn: process.env.JWT_EXPIRATION_DATE,
    });
    return res
      .status(201)
      .json({ msg: "Success", success: true, token: `Bearer ${token}` });
  } catch (err) {
    console.warn(err.message);
    console.warn(err.stack);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};

exports.login = async (req, res) => {
  try {
    const userAccount = await User.findOne({
      where: {
        login: req.body.login,
      },
    });
    if (!userAccount) {
      return res.status(401).json({
        err: "User account with this login could not be found",
        success: false,
      });
    }
    const isPasswordCorrect = await bcrypt.compare(
      req.body.password,
      userAccount.password,
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ err: "Wrong password", success: false });
    }

    const payload = {
      id: userAccount.id,
      login: userAccount.login,
    };
    const token = jwt.sign({ data: payload }, process.env.JWT_TOKEN, {
      expiresIn: process.env.JWT_EXPIRATION_DATE,
    });
    return res.status(202).json({
      msg: "Login succesful",
      success: true,
      token: `Bearer ${token}`,
    });
  } catch (err) {
    console.warn(err.message);
    console.warn(err.stack);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};

const generateResetToken = length => new Promise((resolve, reject) => {
  crypto.randomBytes(length, (err, buffer) => {
    if (err) {
      reject(new Error("Error generating token"));
    }
    const token = buffer.toString("hex");
    resolve(token);
  });
});

const generateEmailMessage = (address, token) => {
  const msg = {
    to: address,
    from: "jozwa.zawadiaka@gmail.com",
    subject: "Password reset token",
    text: token,
  };
  return msg;
};

const removeResetToken = async userId => {
  try {
    const userAccount = await User.findByPk(userId);
    if (Date.now < userAccount.tokenExpirationDate) {
      return;
    }
    userAccount.resetToken = null;
    userAccount.tokenExpirationDate = null;
    userAccount.isResetTokenValid = false;
  } catch (err) {
    console.warn(err.message);
    console.warn(err.stack);
  }
};

exports.sendResetToken = async (req, res) => {
  try {
    const userAccount = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!userAccount) {
      return res.status(401).json({
        err: "User account with this email could not be found",
        success: false,
      });
    }
    const resetToken = await generateResetToken(20);
    userAccount.resetToken = resetToken;
    userAccount.tokenExpirationDate = Date.now() + 1800000; // 30 minutes
    userAccount.isResetTokenValid = true;
    await userAccount.save();
    setTimeout(() => removeResetToken(userAccount.id), 1800010);
    const emailMsg = generateEmailMessage(userAccount.email, resetToken);
    await sgMail.send(emailMsg);
    return res.status(200).json({ msg: "Success", success: true });
  } catch (err) {
    console.warn(err.message);
    console.warn(err.stack);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const userAccount = await User.findOne({
      where: {
        resetToken: req.body.resetToken,
      },
    });
    const hashedPass = await bcrypt.hash(req.body.password, salt);
    userAccount.resetToken = null;
    userAccount.tokenExpirationDate = null;
    userAccount.isResetTokenValid = false;
    userAccount.password = hashedPass;
    await userAccount.save();
    const payload = {
      id: userAccount.id,
      login: userAccount.login,
    };
    const token = jwt.sign({ data: payload }, process.env.JWT_TOKEN, {
      expiresIn: process.env.JWT_EXPIRATION_DATE,
    });
    return res
      .status(201)
      .json({ msg: "Success", success: true, token: `Bearer ${token}` });
  } catch (err) {
    console.warn(err.message);
    console.warn(err.stack);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};
