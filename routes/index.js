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

/* GET home page. */
router.post("/register", authController.register);
router.post("/authenticate", validate.login, authController.login);
router.post("/resetPassword", validate.email, authController.resetPassword);

module.exports = router;
