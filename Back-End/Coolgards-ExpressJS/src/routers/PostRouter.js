import express from "express";
import Post from "../models/Post.js";
import admin from "../middleware/Admin.js";

const router = new express.Router();



// get one post by slug
router.get("/posts/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    let myQuery = {};
    if (slug) {
      myQuery.slug = slug;
    }
    myQuery.status = "published";

    const data = await Post.findOne(myQuery);

    res.status(200).send({
      data: data,
    });
  } catch (e) {
    console.log('e', e);
    res.status(400).send(e);
  }
});



// public get all posts
router.get("/posts", async (req, res) => {
  try {
    const { page, size, title, content, tags } = req.query;

    let myQuery = {};

    if (title) {
      myQuery.title = { $regex: title, $options: "i" };
    }
    if (content) {
      myQuery.content = { $regex: content, $options: "i" };
    }

    if (tags) {
      myQuery.tags = { $in: [tags] };
    }

    let projection = {content: 0, status: 0};

    myQuery.status = "published";

    // pagination
    const pageNum = page ? page - 1 : 0;
    const skip = pageNum * size;

    const data = await Post.find(myQuery, projection)
      .sort({ _id: -1 })
      .limit(req.query.size)
      .skip(skip)
      .exec();
    const total = await Post.find(myQuery, projection);

    res.status(200).send({
      data: data,
      total: total.length,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});


// panel get all posts
router.get("/panel/posts", admin, async (req, res) => {
  try {
    const { page, size, title, content, status, tags } = req.query;

    let myQuery = {};

    if (title) {
      myQuery.title = { $regex: title, $options: "i" };
    }
    if (content) {
      myQuery.content = { $regex: content, $options: "i" };
    }
    if (status) {
      myQuery.status = status;
    }
    if (tags) {
      myQuery.tags = { $in: tags };
    }

    let projection = {};

    // pagination
    const pageNum = page ? page - 1 : 0;
    const skip = pageNum * size;

    const data = await Post.find(myQuery, projection)
      .sort({ _id: -1 })
      .limit(req.query.size)
      .skip(skip)
      .exec();
    const total = await Post.find(myQuery, projection);

    res.status(200).send({
      data: data,
      total: total.length,
    });
  } catch (e) {
    console.log('e', e);
    res.status(400).send(e);
  }
});

// panel add post
router.post("/panel/posts", admin, async (req, res) => {
  try {
    const post = new Post({
      ...req.body,
      writerId: req.user._id,
      writerName: req.user.fullName,
    });
    await post.save();
    res
      .status(201)
      .send({ message: "post was added successfully", data: post });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel edit post
router.patch("/panel/posts", admin, async (req, res) => {
  try {
    const editedPost = await Post.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      {
        new: true,
      }
    );
    res
      .status(200)
      .send({ message: "post was edited successfully", data: editedPost });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel delete post
router.delete("/panel/posts", admin, async (req, res) => {
  try {
    await Post.findByIdAndRemove(req.body._id);
    res.status(200).send({ message: "Post was deleted successfully" });
  } catch (e) {
    res.status(400).send(e);
  }
});
export default router;
