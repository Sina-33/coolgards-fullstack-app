import express from "express";
import Post from "../models/Post.js";
import admin from "../middleware/Admin.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import Message from "../models/Message.js";
import Shipment from "../models/Shipment.js";
import Order from "../models/Order.js";

const router = new express.Router();

// panel get all posts
router.get("/panel/general/dashboard", admin, async (req, res) => {
  try {
    const previousDay = new Date();
    previousDay.setDate(previousDay.getDate() - 1);
    // get new documents in the last 24 hours

    //users
    const newUsersCount = await User.find({ createdAt: { $gte: previousDay } });
    const totalUsersCount = await User.countDocuments({});

    //news
    const newNewsCount = await Post.find({ createdAt: { $gte: previousDay } });
    const totalNewsCount = await Post.countDocuments({});

    //products
    const newProductsCount = await Product.find({
      createdAt: { $gte: previousDay },
    });
    const totalProductsCount = await Product.countDocuments({});

    //messages
    const newMessagesCount = await Message.find({
      createdAt: { $gte: previousDay },
    });
    const totalMessagesCount = await Message.countDocuments({});

    //orders
    const newOrdersCount = await Order.find({
      createdAt: { $gte: previousDay },
    });
    const totalOrdersCount = await Order.countDocuments({});

    res.status(200).send({
      newUsersCount: newUsersCount.length,
      totalUsersCount,
      newNewsCount: newNewsCount.length,
      totalNewsCount,
      newProductsCount: newProductsCount.length,
      totalProductsCount,
      newMessagesCount: newMessagesCount.length,
      totalMessagesCount,
      newOrdersCount: newOrdersCount.length,
      totalOrdersCount,
    });
  } catch (e) {
    console.log("e", e);
    res.status(400).send(e);
  }
});

const calculateTotalPrice = (crt) => {
  let total = 0;
  for (let item of crt) {
    total += item.price * item.quantity;
  }
  return total
};

const totalItems = (crt) => {
  let res = 0;
  for (let x of crt) {
    res += x.quantity;
  }
  return res;
}

// refresh cart items
router.post("/cart", async (req, res) => {
  const ids = req.body.cart.map((item) => item._id);
  try {
    const records = await Product.find({ _id: { $in: ids } }).lean();
    const recordsWithQuantity = await records.map((obj, i) => ({
      ...obj,
      quantity: req.body.cart[i].quantity,
    }));
    const selectedShipmentPlan = await Shipment.findOne({
      _id: req.body.shipmentPlan,
    });


    res.status(200).send({
      cart: recordsWithQuantity,
      orderInfo: {
        totalItems: totalItems(recordsWithQuantity),
        totalItemsPrice: calculateTotalPrice(recordsWithQuantity),
        totalShipmentPrice: selectedShipmentPlan.shipmentPrice,
        totalVatPrice: calculateTotalPrice(recordsWithQuantity) * (selectedShipmentPlan.vat / 100),
        totalPrice: calculateTotalPrice(
          recordsWithQuantity) + (calculateTotalPrice(
          recordsWithQuantity) * selectedShipmentPlan.vat/ 100) + selectedShipmentPlan.shipmentPrice,
      },
    });
  } catch (e) {
    console.log("e", e);
    res.status(400).send(e);
  }
});

export default router;
