import express from "express";
import Shipment from "../models/Shipment.js";
import admin from "../middleware/Admin.js";

const router = new express.Router();

// public get all shipments
router.get("/shipments", async (req, res) => {
  try {
    const {country, shipmentPrice, vat } = req.query;

    let myQuery = {};

    if (country) {
      myQuery.title = { $regex: country, $options: "i" };
    }
    if (shipmentPrice) {
      myQuery.content = { $regex: shipmentPrice, $options: "i" };
    }
    if (vat) {
      myQuery.content = { $regex: vat, $options: "i" };
    }

    let projection = {};


    const data = await Shipment.find(myQuery, projection)
      .sort().exec();
    const total = await Shipment.find(myQuery, projection);

    res.status(200).send({
      data: data,
      total: total.length,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel get all shipments
router.get("/panel/shipments", admin, async (req, res) => {
  try {
    const { page, size, country, shipmentPrice, vat } = req.query;

    let myQuery = {};

    if (country) {
      myQuery.title = { $regex: country, $options: "i" };
    }
    if (shipmentPrice) {
      myQuery.content = { $regex: shipmentPrice, $options: "i" };
    }
    if (vat) {
      myQuery.content = { $regex: vat, $options: "i" };
    }

    let projection = {};

    // pagination
    const pageNum = page ? page - 1 : 0;
    const skip = pageNum * size;

    const data = await Shipment.find(myQuery, projection)
      .sort()
      .limit(req.query.size)
      .skip(skip)
      .exec();
    const total = await Shipment.find(myQuery, projection);

    res.status(200).send({
      data: data,
      total: total.length,
    });
  } catch (e) {
    console.log("e", e);
    res.status(400).send(e);
  }
});

// panel add shipment
router.post("/panel/shipments", admin, async (req, res) => {
  try {
    const shipment = new Shipment(req.body);
    await shipment.save();
    res
      .status(201)
      .send({ message: "Shipment was added successfully", data: shipment });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel edit Shipment
router.patch("/panel/shipments", admin, async (req, res) => {
  try {
    const editedShipment = await Shipment.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      {
        new: true,
      }
    );
    res
      .status(200)
      .send({
        message: "Shipment was edited successfully",
        data: editedShipment,
      });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel delete Shipment
router.delete("/panel/shipments", admin, async (req, res) => {
  try {
    await Shipment.findByIdAndRemove(req.body._id);
    res.status(200).send({ message: "Shipment was deleted successfully" });
  } catch (e) {
    res.status(400).send(e);
  }
});
export default router;
