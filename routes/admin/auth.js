const express = require("express");
const { check, validationResult } = require("express-validator");

const { handleErrors } = require('./middlewares');
const usersRepo = require("../../repositories/users");
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");
const {
  requireEmail,
  requirePassword,
  requirePasswordConfirmation,
  requireEmailExists,
  requireValidPasswordForUser,
} = require("./validators");

//create router as defining routes touside of index.js
const router = express.Router();

router.get("/signup", (req, res) => {
  //send template html to client
  res.send(signupTemplate({ req }));
});

router.post(
  "/signup",
  //results in all this validation getting attached to request object
  //by express-validator
  [requireEmail, requirePassword, requirePasswordConfirmation],
  handleErrors(signupTemplate),
  async (req, res) => {
    const { email, password, passwordConfirmation } = req.body;
    //create user in repo and pass in attributes object
    const user = await usersRepo.create({ email, password });
    //store id of user in users cookie
    req.session.userId = user.id;
    res.redirect('/admin/products');
  }
);

router.get("/signout", (req, res) => {
  //clear cookie data
  req.session = null;
  res.send("Your are signed out");
});

router.get("/signin", (req, res) => {
  res.send(signinTemplate({}));
});

router.post(
  "/signin",
  [requireEmailExists, requireValidPasswordForUser],
  handleErrors(signinTemplate),
  async (req, res) => {
    //extract form data from body of request
    const { email } = req.body;
    //get user details and store in cookie
    const user = await usersRepo.getOneBy({ email });
    req.session.userId = user.id;

    res.redirect('/admin/products');
  }
);

module.exports = router;
