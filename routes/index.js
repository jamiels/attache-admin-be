const express = require("express");

const router = express.Router();
const authController = require("../controllers/auth_controller");
const validate = require("../utility/validators");

const checkToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];

    req.token = token;
    next();
  } else {
    // If header is undefined return Forbidden (403)
    res.sendStatus(403);
  }
};

router.post("/register", validate.register, authController.register);
router.post("/authenticate", validate.login, authController.login);
router.post("/sendResetToken", validate.email, authController.sendResetToken);
router.post("/resetPassword", validate.password, authController.resetPassword);

module.exports = router;
