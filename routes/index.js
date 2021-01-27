const express = require("express");

const router = express.Router();
const authController = require("../controllers/auth_controller");
const restApiController = require("../controllers/rest_api_controller");
const quoteServerController = require("../controllers/quote_server_controller");
const validate = require("../utility/validators");

const checkToken = (req, res, next) => {
  const header = req.headers.authorization;
  console.log(req.headers);
  if (typeof header !== "undefined") {
    const bearer = header.split(" ");
    const token = bearer[1];
    console.log(token);
    req.token = token;
    next();
  } else {
    // If header is undefined return Forbidden (403)
    res.sendStatus(401);
  }
};

router.get("/getVideos", restApiController.getVideos);
router.put("/changeFlag/:object/:id", restApiController.changeFlag);

// to do - add validators
router.post("/register", validate.register, authController.register);
router.post("/authenticate", validate.login, authController.login);
router.post("/sendResetToken", validate.email, authController.sendResetToken);
router.post("/resetPassword", validate.password, authController.resetPassword);
router.post(
  "/resetUserPassword",
  checkToken,
  authController.resetPasswordByAdmin,
);
router.post("/:object", checkToken, restApiController.create);

router.get("/:object", checkToken, restApiController.retrieveAll);
router.get("/:object/:id", checkToken, restApiController.retrieve); // will change to one method for both

router.delete("/:object/:id", checkToken, restApiController.delete);
router.put("/:object/:id", checkToken, restApiController.edit);

router.get(
  "/quoteserver/:id/:action",
  checkToken,
  quoteServerController.getQuote,
);

// I am not sure if you wanted jwt token check in this one
module.exports = router;
