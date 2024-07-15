const { Router } = require("express");
const User = require("../models/user");
const { generateToken } = require("../Authentication/index");

const router = Router();

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.render("signin");
});

router.post("/signin", async (req, res) => {
  try {
    let { email, password } = req.body;

    let user = await User.matchPassword(email, password);

    if (user.userExisted != true || user.passwordMatched != true) {
      return res.render("signin", {
        error: user,
      });
    }

    let token = await generateToken({
      _id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin");
  }
});

router.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.create({
    name: name,
    email: email,
    password: password,
  });

  return res.render("signin");
});

module.exports = router;
