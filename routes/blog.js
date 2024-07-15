const { Router } = require("express");
const blog = require("../models/blog");
const comment = require("../models/comments");
const multer = require("multer");
const path = require("path");
const { body, validationResult } = require("express-validator");

// Setup Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve("./public/uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
  },
});

const upload = multer({ storage });

const router = Router();

// Add comment to a blog post
router.post("/comment/:id", async (req, res) => {
  const blogId = req.params.id;
  const { content } = req.body;
  const userId = req.userData?._id;

  if (!content || !userId) {
    return res.status(400).redirect(`/blog/${blogId}`);
  }

  try {
    await comment.create({
      content,
      createdBy: userId,
      blogId,
    });
    res.redirect(`/blog/${blogId}`);
  } catch (error) {
    console.error("Error posting comment:", error);
    res.redirect(`/blog/${blogId}`);
  }
});

// Retrieve blog post by ID
router.get("/:blogId", async (req, res) => {
  const blogId = req.params.blogId;

  try {
    const blogItem = await blog.findById(blogId).populate("createdBy");
    if (!blogItem) {
      return res.status(404).redirect("/");
    }
    const comments = await comment.find({ blogId }).populate("createdBy");

    res.render("blog", {
      blogItem,
      user: req.userData,
      comments,
    });
  } catch (error) {
    console.error("Error retrieving blog:", error);
    res.redirect("/");
  }
});

// Add a new blog post
router.post("/addblog", upload.single("coverImgurl"), async (req, res) => {
  const { title, body } = req.body;
  const coverImgurl = req.file ? `/uploads/${req.file.filename}` : "";

  if (!title || !body) {
    return res.status(400).redirect("/addblog");
  }

  try {
    await blog.create({
      title,
      body,
      coverImgurl,
      createdBy: req.userData._id || "",
    });
    res.redirect("/");
  } catch (error) {
    console.error("Error posting blog:", error);
    res.status(500).redirect("/addblog");
  }
});

// Serve uploaded images
router.get("/uploads/:name", (req, res) => {
  const fileName = path.basename(req.params.name); // Sanitize filename
  res.sendFile(path.resolve(`./public/uploads/${fileName}`));
});

module.exports = router;
