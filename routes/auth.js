const express = require("express");
const { check, body } = require("express-validator");
const User = require("../models/user");
const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  [
    body("email")
      .custom((value) => {
        if (value.length === 0) {
          throw new Error("Email is required");
        }
        return true;
      })
      .isEmail()
      .withMessage("Incorrect email format")
      .normalizeEmail(),
    body("password")
      .custom((value) => {
        if (value.length === 0) {
          throw new Error("Password is required");
        }
        return true;
      })
      .trim(),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        if (!value.includes("yopmail.com")) {
          throw new Error(
            "Please use email addresses of only yopmail.com domain."
          );
        }
        return true;
      })
      .custom((value) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject(
              "E-mail already exists. Please pick a different one."
            );
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 5 characters."
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match!");
        }
        return true;
      }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/resetPassword/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
