import express from "express";
import Product from "../models/Product.js";
import admin from "../middleware/Admin.js";

const router = new express.Router();



// get one product by slug
router.get("/products/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    let myQuery = {};
    if (slug) {
      myQuery.slug = slug;
    }

    const data = await Product.findOne(myQuery);

    res.status(200).send({
      data: data,
    });
  } catch (e) {
    console.log('e', e);
    res.status(400).send(e);
  }
});



// public get all products
router.get("/products", async (req, res) => {
  try {
    const { page, size, title, content, tags, price } = req.query;

    let myQuery = {};

    if (title) {
      myQuery.title = { $regex: title, $options: "i" };
    }
    if (price) {
      myQuery.content = { $regex: price, $options: "i" };
    }
    let projection = {};
    // pagination
    const pageNum = page ? page - 1 : 0;
    const skip = pageNum * size;

    const data = await Product.find(myQuery, projection)
      .sort({ price: -1 })
      .limit(req.query.size)
      .skip(skip)
      .exec();
    const total = await Product.find(myQuery, projection);
    res.status(200).send({
      data: data,
      total: total.length,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});


// panel get all products
router.get("/panel/products", admin, async (req, res) => {
  try {
    const { page, size, title, content, status, tags, price } = req.query;

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
    if (price) {
      myQuery.content = { $regex: price, $options: "i" };
    }

    let projection = {};

    // pagination
    const pageNum = page ? page - 1 : 0;
    const skip = pageNum * size;

    const data = await Product.find(myQuery, projection)
      .sort({ _id: -1 })
      .limit(req.query.size)
      .skip(skip)
      .exec();
    const total = await Product.find(myQuery, projection);

    res.status(200).send({
      data: data,
      total: total.length,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel add product
router.post("/panel/products", admin, async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res
      .status(201)
      .send({ message: "product was added successfully", data: product });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel edit product
router.patch("/panel/products", admin, async (req, res) => {
  try {
    const editedProduct = await Product.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      {
        new: true,
      }
    );
    res
      .status(200)
      .send({ message: "product was edited successfully", data: editedProduct });
  } catch (e) {
    res.status(400).send(e);
  }
});

// panel delete product
router.delete("/panel/products", admin, async (req, res) => {
  try {
    await Product.findByIdAndRemove(req.body._id);
    res.status(200).send({ message: "Product was deleted successfully" });
  } catch (e) {
    res.status(400).send(e);
  }
});
export default router;
