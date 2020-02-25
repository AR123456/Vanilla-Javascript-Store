const express = require("express");
// destructure check from express-validator so not expressValidator.check is needed, can just use check
const { check } = require("express-validator");
const usersRepo = require("../../repositories/users");
const router = express.Router();
const signupTemplate = require("../../views/admin/auth/signup");
const signinTemplate = require("../../views/admin/auth/signin");

router.get("/signup", (req, res) => {
  res.send(signupTemplate({ req: req }));
});
// expresss validator - pass in an array with the post request
// inside array tell express to do some validation on the inputs
// being provided to the call back or route handler from the browser
// check("username").isEmail() syntax is looking for this inside the request body
// then check that it is an email
//the oject that comes back contains any errors getting the data
router.post(
  "/signup",[
    // passing in the array for express validator
    // experss validator uses the validator library in a way that is easy for express
    // validation checks to make sure it satisfys criteria 
    // sanitization  changes the value that the user has provided - to make sure the value is reliable like taking out white space 
    
    check("email"),
    check("password"),
    check("passwordConfirmation")

  ]

  async (req, res) => {
    // console.log(req.body);
    // const { email, password, passwordConfirmation } = req.body;
    // const existingUser = await usersRepo.getOneBy({ email: email });
    // // getting the error messages below into the template(form) using this method is challanging
    // // express validator helps with this
    // if (existingUser) {
    //   return res.send("email taken ");
    // }
    // if (password !== passwordConfirmation) {
    //   return res.send("passwords do not match ");
    // }

    // const user = await usersRepo.create({ email, password });
    // req.session.userId = user.id;
    // res.send("account created");
    //// the expresss way
    console.log(req.body);
    const { email, password, passwordConfirmation } = req.body;
    const existingUser = await usersRepo.getOneBy({ email: email });
    // getting the error messages below into the template(form) using this method is challanging
    // express validator helps with this
    if (existingUser) {
      return res.send("email taken ");
    }
    if (password !== passwordConfirmation) {
      return res.send("passwords do not match ");
    }

    const user = await usersRepo.create({ email, password });
    req.session.userId = user.id;
    res.send("account created");
  }
);
router.get("/signout", (req, res) => {
  req.session = null;
  res.send("you are logged out ");
});
router.get("/signin", (req, res) => {
  res.send(signinTemplate({ req: req }));
});
router.post("/signin", async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;
  const user = await usersRepo.getOneBy({ email });
  if (!user) {
    return res.send("email not found ");
  } else {
    const validPassword = await usersRepo.comparePasswords(
      user.password,
      password
    );
    if (!validPassword) {
      return res.send("invalid password");
    }
    req.session.userId = user.id;
    res.send("You are signed in");
  }
});
//make all the files avalible to project
module.exports = router;
