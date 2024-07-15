require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const { connect } = require("mongoose");
const path = require("path");
const PORT = process.env.PORT;
const Mongourl = process.env.MONGO_URL;
const userRouter = require("./routes/user");
const blogRouter = require("./routes/blog");
const { VerifyToken, CheckAuthentication } = require("./Authentication/index");
const blog = require("./models/blog");

const app = express();

connect(Mongourl)
  .then(() => console.log("Connected to DB"))
  .catch((err) => console.log("Failed to Connecte, Error:", err));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.resolve("./public")));

app.use(cookieParser());

app.use("/user", userRouter);
app.use("/blog", CheckAuthentication, blogRouter);

app.get("/", CheckAuthentication, async (req, res) => {
  const allBlogs = await blog.find({}).sort("createdAt");
  res.render("home", {
    user: req.userData,
    blogs: allBlogs,
  });
});

app.get("/addblog", CheckAuthentication, (req, res) => {
  res.render("addblog", {
    user: req.userData,
  });
});

app.listen(PORT, () => console.log(`Server Started At PORT:${PORT}`));
