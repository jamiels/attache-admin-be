const { check, validationResult } = require("express-validator");

exports.register = [
  check("login")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("User name can not be empty!")
    .bail(),
  check("firstName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("First name can not be empty!")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Minimum 2 characters required!")
    .bail(),
  check("lastName")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Last name can not be empty!")
    .bail()
    .isLength({ min: 2 })
    .withMessage("Minimum 2 characters required!")
    .bail(),
  check("password")
    .trim()
    .bail()
    .escape()
    .bail()
    .notEmpty()
    .withMessage("Password can not be empty!")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters required!")
    .bail(),
  check("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address!")
    .bail()
    .normalizeEmail()
    .bail(),
  (req, res, next) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

exports.login = [
  check("login")
    .trim()
    .escape()
    .not()
    .isEmpty()
    .withMessage("User name can not be empty!")
    .bail(),
  check("password")
    .trim()
    .escape()
    .notEmpty()
    .withMessage("Password can not be empty!")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters required!")
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

exports.email = [
  check("email")
    .trim()
    .isEmail()
    .withMessage("Invalid email address!")
    .bail()
    .normalizeEmail()
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];

exports.password = [
  check("password")
    .trim()
    .bail()
    .escape()
    .bail()
    .notEmpty()
    .withMessage("Password can not be empty!")
    .bail()
    .isLength({ min: 3 })
    .withMessage("Minimum 3 characters required!")
    .bail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    next();
  },
];
