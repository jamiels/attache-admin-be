const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const User = require("../models/user");
const getUserDataFromJWT = require("../utility/getUserFromToken");
const logError = require("../utility/logError");

// const { salt } = process.env;
const salt = bcrypt.genSaltSync(10);
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const tokenResetTemplate = (address, token) => {
  const msg = {
    to: address,
    subject: "Password reset token",
    text: token,
  };
  return msg;
};

const confirmationTemplate = (address, username) => {
  const msg = {
    to: address,
    subject: "Created account and we want to notify you",
    text: `Hello there, ${username}. Thanks for registering at attache. iid  If you didn't do that you need to do something.`,
  };
  return msg;
};

const sendEmail = async body => {
  const email = { ...body, from: "jozwa.zawadiaka@gmail.com" };
  await sgMail.send(email);
};

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
      login: req.body.login,
      password: hashedPass,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
    });
    const { id, login, email } = newUserAccount;
    await sendEmail(confirmationTemplate(email, login));
    const payload = {
      id,
      login,
    };
    const token = jwt.sign({ data: payload }, process.env.JWT_TOKEN, {
      expiresIn: process.env.JWT_EXPIRATION_DATE,
    });
    return res.status(201).json({
      msg: "Success",
      success: true,
      token: `Bearer ${token}`,
      userId: id,
    });
  } catch (err) {
    logError(err);
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
      userId: userAccount.id,
    });
  } catch (err) {
    logError(err);
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
    logError(err);
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
    const emailMsg = tokenResetTemplate(userAccount.email, resetToken);
    await sendEmail(emailMsg);
    return res.status(200).json({ msg: "Success", success: true });
  } catch (err) {
    logError(err);
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
    if (!userAccount) {
      return res.status(400).json({ err: "Wrong reset token", success: false });
    }
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
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};

exports.resetPasswordByAdmin = async (req, res) => {
  try {
    const adminUser = await getUserDataFromJWT(req.token);
    if (!adminUser) {
      return res.status(403).json({ err: "Token wrong", success: false });
    }
    const { password, id } = req.body;
    const userAccount = await User.findByPk(id);
    console.log(userAccount);
    const hashedPass = await bcrypt.hash(password, salt);
    userAccount.password = hashedPass;
    await userAccount.save();
    return res.status(201).json({ msg: "Success", success: true });
  } catch (err) {
    logError(err);
    return res.status(400).json({ err: "Somethings wrong", success: false });
  }
};
