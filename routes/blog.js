const { Router } = require("express");
const blog = require("../models/blog");
const comment = require("../models/comments");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads`));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}.${file.mimetype.split("/")[1]}`
    );
  },
});

const upload = multer({ storage: storage });

const router = Router();

//posting comments
router.post("/comment/:id", async (req, res) => {
  let blogId = req.params.id;
  await comment.create({
    content: req?.body.content,
    createdBy: req?.userData?._id,
    blogId: blogId,
  });

  return res.redirect(`/blog/${blogId}`);
});

//retriveing blog by Id
router.get("/:blogId", async (req, res) => {
  try {
    let blogId = req.params.blogId;
    console.log("obj id: " + blogId);
    const blogItem = await blog.findById(blogId).populate("createdBy");
    const Comment = await comment
      .find({ blogId: blogId })
      .populate("createdBy");

    return res.render("blog", {
      blogItem: blogItem,
      user: req.userData,
      comments: Comment,
    });
  } catch (error) {
    console.log("Error in blog retrive :", error);
    return res.redirect("/");
  }
});

//posting blog
router.post("/addblog", upload.single("coverImgurl"), async (req, res) => {
  try {
    let coverImgurl = `/uploads/${req?.file?.filename}`;
    const { title, body } = req.body;
    const result = await blog.create({
      title,
      body,
      coverImgurl,
      createdBy: req?.userData._id || "",
    });
    console.log(result);
    res.redirect("/");
  } catch (error) {
    res.redirect("/addblog", {
      error: "failed to upload",
    });
  }
});

//retriving image
router.get("/uploads/:name", (req, res) => {
  res.sendFile(path.resolve(`./public/uploads/${req.params.name}`));
});

module.exports = router;
