const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");
const User = require("../models/user");
const { check, body } = require("express-validator"); //check cheks all the feild like,params,body,query etc...
//their in built body ,query ,params chekcker too

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please enter a valid email address."),
    body("password", "Password has to be valid.")
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);
router.post("/logout", authController.postLogout);
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Invalid Email")
      .normalizeEmail()
      //async validation
      .custom((value, { req }) => {
        //we can add custom check too
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("email already exist pick different one");
          }
        });
      }),
    body(
      "password",
      "Plese enter a password with only number and text and must be greater than length of 5 "
    ) //body() function checks the req body only dosen't worry about the params,or query.
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Password confirmation does not match password");
        }
        // Indicates the success of this synchronous custom validator
        return true;
      }),
  ],
  authController.postSignup
);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getPasswordUpdate);
router.post("/new-password", authController.postPasswordUpdate);
module.exports = router;
