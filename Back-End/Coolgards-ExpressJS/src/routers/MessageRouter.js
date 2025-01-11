import express from "express";
import Message from "../models/Message.js";
import admin from "../middleware/Admin.js";

const router = new express.Router();

// panel get all messages
router.get("/panel/messages", admin, async (req, res) => {
  try {
    const { name, email, phone, subject, content, status, size, page } =
      req.query;

    let myQuery = {};

    if (name) {
      myQuery.name = { $regex: name, $options: "i" };
    }
    if (email) {
      myQuery.email = { $regex: email, $options: "i" };
    }
    if (phone) {
      myQuery.phone = { $regex: phone, $options: "i" };
    }
    if (subject) {
      myQuery.subject = { $regex: subject, $options: "i" };
    }
    if (content) {
      myQuery.content = { $regex: content, $options: "i" };
    }
    if (status) {
      myQuery.status = status;
    }

    let projection = {};

    // pagination
    const pageNum = page ? page - 1 : 0;
    const skip = pageNum * size;

    const data = await Message.find(myQuery, projection)
      .sort({ _id: -1 })
      .limit(req.query.size)
      .skip(skip)
      .exec();
    const total = await Message.find(myQuery, projection);

    res.status(200).send({
      data: data,
      total: total.length,
    });
  } catch (e) {
    console.log("e", e);
    res.status(400).send(e);
  }
});

// public add message
router.post("/panel/messages", async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res
      .status(201)
      .send({ message: "message was added successfully", data: message });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel delete message
router.delete("/panel/messages", admin, async (req, res) => {
  try {
    await Message.findByIdAndRemove(req.body._id);
    res.status(200).send({ message: "Message was deleted successfully" });
  } catch (e) {
    res.status(400).send(e);
  }
});
export default router;
