import express from "express";
import User from "../models/User.js";
import auth from "../middleware/Auth.js";
import admin from "../middleware/Admin.js";
import bcrypt from "bcryptjs";
import { v4 as uuid } from 'uuid';

const router = new express.Router();

// panel get all users
router.get("/panel/users", admin, async (req, res) => {
  try {
    const { page, size, email, fullName, roles } = req.query;

    let myQuery = {};

    if (email) {
      myQuery.email = { $regex: email, $options: "i" };
    }
    if (fullName) {
      myQuery.fullName = { $regex: fullName, $options: "i" };
    }
    if (roles) {
      myQuery.roles = { $in: [roles] };
    }

    let projection = {
      // _id: 1,
      // email: 1,
      // fullName: 1,
      // roles: 1,
    };

    // pagination
    const pageNum = page ? page - 1 : 0;
    const skip = pageNum * size;

    const users = await User.find(myQuery, projection)
      .sort({ _id: -1 })
      .limit(req.query.size)
      .skip(skip)
      .exec();
    const total = await User.find(myQuery, projection);

    res.status(200).send({
      data: users,
      total: total.length,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel add user
router.post("/panel/users", admin, async (req, res) => {
  try {
    const prevUser = await User.findOne({ email: req.body.email });
    if (!prevUser) {
      const user = new User({ ...req.body });
      user.password = await bcrypt.hash(req.body.password, 8);
      await user.save();
      res
        .status(201)
        .send({ message: "user was created successfully", data: user });
    } else {
      res.status(409).send({ message: "this email already exists" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel edit user
router.patch("/panel/users", admin, async (req, res) => {
  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 8);
    } else {
      delete req.body.password;
    }
    const user = await User.findOneAndUpdate({ _id: req.body._id }, req.body, {
      new: true,
    });
    res
      .status(204)
      .send({ message: "user was edited successfully", data: user });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel delete user
router.delete("/panel/users", admin, async (req, res) => {
  try {
    await User.findByIdAndRemove(req.body._id);
    res.status(200).send({ message: "user was deleted successfully" });
  } catch (e) {
    res.status(400).send(e);
  }
});

//customer signup
router.post("/users", async (req, res) => {
  try {
    const prevUser = await User.findOne({ email: req.body.email });
    if (!prevUser) {
      const user = new User({ ...req.body, roles: ["customer"] });
      user.password = await bcrypt.hash(req.body.password, 8);
      await user.save();
      const token = await user.generateAuthToken(req.useragent);
      let expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      res.status(201)
        .cookie("cookieToken", token, { expires: expiryDate, httpOnly: true })
        .send({
          data: user,
          message: "welcome to coolgards ;)",
        });
    } else {
      res.status(409).send({ message: "this email already exists" });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});

// general login
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(401)
        .send({ message: "there is no such user, please Sign up first!" });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "wrong username or password!" });
    }
    const token = await user.generateAuthToken(req.useragent);
    let expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    res.status(200)
      .cookie("cookieToken", token, { expires: expiryDate, httpOnly: true })
      .send({ data: user,
        message: "welcome back ;)",
      });
  } catch (e) {
    console.log(e);
    res.status(400).send(e);
  }
});

// logout current session for current user
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send({ message: "You have successfully logged out" });
  } catch (e) {
    res.status(400).send(e);
  }
});

// logout all sessions for current user
router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send({
      message: "all sessions were logged out successfully",
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

// get currently logged-in user info
router.get("/users/me", auth, async (req, res) => {
  res.send({
    data: req.user,
    message: "profile info successfully retrieved",
  });
});

// edit currently logged-in user info
router.patch("/users/me", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = [
      "fullName",
      "email",
      "password",
      "country",
      "city",
      "address",
      "postalCode",
      "mobilePhone",
      "createdAt",
      "updatedAt",
      "__v",
      "_id",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ message: "Invalid updates!" });
    }
    for (const update of updates) {
      if (update === "password") {
        req.user[update] = await bcrypt.hash(req.body[update], 8);
      }else {
        req.user[update] = req.body[update]
      }
    }


      await req.user.save();
    res.status(200).send({
      data: req.user,
      message: "profile updated successfully",
    });
  } catch (e) {
    res.status(400).send(e);
  }
});


// generate and send reset password link
router.post("/forgot", async (req, res) => {
  try {
    const foundUser = await User.findOne({ email: req.body.email });
    if (foundUser) {
      const uid = uuid()
      foundUser.resetCode = uid
      await foundUser.save();
      const url = process.env.BASE_URL + "/reset/" + foundUser._id  + "/" + uid
      res.status(200).send({
        message: "Reset email was send successfully, please check your inbox",
      });
    } else {
      res.status(400).send({
        message: "No user with this email address was found",
      });
    }
  } catch (e) {
    res.status(400).send(e);
  }
});


router.get("/reset/:id/:code", async (req, res) => {
  try {
    const foundUser = await User.findOne({ _id: req.params.id }).orFail();
    if (foundUser && foundUser.resetCode === req.params.code) {
      res.status(200).send({
        data: req.params,
        message: "Please enter your new password"
      });
    } else {
      res.status(400).send({
        message: "Sorry! Your reset link has expired",
      });
    }
  } catch (e) {
    console.log('e', e);
    res.status(400).send(e);
  }
});

router.post("/reset", async (req, res) => {
  try {
    const foundUser = await User.findOne({ _id: req.body.id }).orFail();
    if (foundUser && foundUser.resetCode === req.body.code) {
      foundUser.password = await bcrypt.hash(req.body.password, 8);
      foundUser.resetCode = "";
      await foundUser.save();
      res.status(200).send({
        message: "Your password was changed successfully",
      });
    } else {
      res.status(400).send({
        message: "Sorry! Your reset link has expired",
      });
    }
  } catch (e) {
    console.log('e', e);
    res.status(400).send(e);
  }
});

export default router;
