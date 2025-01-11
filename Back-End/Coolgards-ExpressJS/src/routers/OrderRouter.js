import express from "express";
import Order from "../models/Order.js";
import admin from "../middleware/Admin.js";
import bcrypt from "bcryptjs";
import Product from "../models/Product.js";
import Shipment from "../models/Shipment.js";
import User from "../models/User.js";

const router = new express.Router();

// panel get all orders
router.get("/panel/orders", admin, async (req, res) => {
  try {
    const {
      page,
      size,
      userId,
      status,
      totalItems,
      totalItemsPrice,
      totalShipmentPrice,
      totalVatPrice,
      totalPrice,
    } = req.query;

    let myQuery = {};

    if (userId) {
      myQuery.userId = { $regex: userId, $options: "i" };
    }
    if (status) {
      myQuery.status = { $in: [status] };
    }
    if (totalItems) {
      myQuery.totalItems = { $regex: totalItems, $options: "i" };
    }
    if (totalItemsPrice) {
      myQuery.totalItemsPrice = { $regex: totalItemsPrice, $options: "i" };
    }
    if (totalShipmentPrice) {
      myQuery.totalShipmentPrice = {
        $regex: totalShipmentPrice,
        $options: "i",
      };
    }
    if (totalVatPrice) {
      myQuery.totalVatPrice = { $regex: totalVatPrice, $options: "i" };
    }
    if (totalPrice) {
      myQuery.totalPrice = { $regex: totalPrice, $options: "i" };
    }

    let projection = {};

    // pagination
    const pageNum = page ? page - 1 : 0;
    const skip = pageNum * size;

    const orders = await Order.find(myQuery, projection)
      .sort()
      .limit(req.query.size)
      .skip(skip)
      .exec();
    const total = await Order.find(myQuery, projection);

    res.status(200).send({
      data: orders,
      total: total.length,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel add order
router.post("/panel/orders", admin, async (req, res) => {
  try {
    const order = new Order({ ...req.body });
    await order.save();
    res
      .status(201)
      .send({ message: "order was created successfully", data: order });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel edit order
router.patch("/panel/orders", admin, async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      {
        new: true,
      }
    );
    res
      .status(204)
      .send({ message: "order was edited successfully", data: order });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel delete order
router.delete("/panel/orders", admin, async (req, res) => {
  try {
    await Order.findByIdAndRemove(req.body._id);
    res.status(200).send({ message: "order was deleted successfully" });
  } catch (e) {
    res.status(400).send(e);
  }
});

const totalItems = (crt) => {
  let res = 0;
  for (let x of crt) {
    res += x.quantity;
  }
  return res;
};
const calculateTotalPrice = (crt) => {
  let total = 0;
  for (let item of crt) {
    total += item.price * item.quantity;
  }
  return total;
};

//customer add order
router.post("/orders", async (req, res) => {
  try {
    let token = null;
    let expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    // check if user is anonymous to create an account
    if (!req.body.userInfo.hasOwnProperty("_id")) {
      const prevUser = await User.findOne({ email: req.body.userInfo.email });
      if (!prevUser) {
        const user = new User({ ...req.body.userInfo, roles: ["customer"] });
        user.password = await bcrypt.hash(req.body.userInfo.password, 8);
        await user.save();
        token = await user.generateAuthToken(req.useragent);
      } else {
        return res
          .status(409)
          .send({ message: "this email already exists please login first" });
      }
    }

    // refresh cart
    const ids = req.body.cart.map((item) => item._id);
    const records = await Product.find({ _id: { $in: ids } }).lean();
    const recordsWithQuantity = await records.map((obj, i) => ({
      ...obj,
      quantity: req.body.cart[i].quantity,
    }));
    const selectedShipmentPlan = await Shipment.findOne({
      _id: req.body.shipmentPlan,
    });

    // create order
    const order = new Order();
    order.status = "CREATED";
    order.cart = recordsWithQuantity;

    // adding order info to order
    order.totalItems = totalItems(recordsWithQuantity);
    order.totalItemsPrice = calculateTotalPrice(recordsWithQuantity);
    order.totalShipmentPrice = selectedShipmentPlan.shipmentPrice;
    order.totalVatPrice =
      calculateTotalPrice(recordsWithQuantity) *
      (selectedShipmentPlan.vat / 100);
    order.totalPrice =
      calculateTotalPrice(recordsWithQuantity) +
      (calculateTotalPrice(recordsWithQuantity) * selectedShipmentPlan.vat) /
        100 +
      selectedShipmentPlan.shipmentPrice;

    // adding user info to order
    order.userEmail = req.body.userInfo.email;
    order.address.fullName = req.body.userInfo.fullName;
    order.address.country = selectedShipmentPlan.country;
    order.address.city = req.body.userInfo.city;
    order.address.address = req.body.userInfo.address;
    order.address.postalCode = req.body.userInfo.postalCode;
    order.address.mobilePhone = req.body.userInfo.mobilePhone;
    await order.save();

    if (!req.body.userInfo.hasOwnProperty("_id")) {
      return res
        .status(201)
        .cookie("cookieToken", token, { expires: expiryDate, httpOnly: true })
        .send({
          message: "order and user was created successfully",
          data: order,
        });
    } else {
      return res
        .status(201)
        .send({ message: "order was created successfully", data: order });
    }
  } catch (e) {
    console.log("e", e);
    res.status(400).send(e);
  }
});

export default router;
