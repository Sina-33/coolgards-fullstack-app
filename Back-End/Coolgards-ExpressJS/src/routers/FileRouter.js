import express from "express";
import File from "../models/File.js";
import multer from "multer";
import admin from "../middleware/Admin.js";
import { unlink } from "fs/promises";
const router = new express.Router();

const fileNameGenerator = (req, file, cb) => {
  const extension = file.originalname.match(/[0-9a-z]+$/i)[0];
  const uniqueSuffix = Math.round(Math.random() * 1e9);
  cb(
    null,
    `${Date.now()}-${file.originalname.replace(
      /\.[^/.]+$/,
      ""
    )}-${uniqueSuffix}.${extension}`
  );
};

const publicMulterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "media");
  },
  filename: fileNameGenerator,
});

const publicUploader = multer({
  storage: publicMulterStorage,
});

const uploaderController = async (req, res) => {
  try {
    let response = [];
    for (const file of req.files) {
      const model = {
        ...file,
        name: file.originalname,
        category: req.body.category,
        user: req.user?._id,
        product: req.body.product,
        order: req.body.order,
      };
      delete model.fieldname;
      delete model.originalname;
      delete model.destination;
      model.path = "/api/" + file.path.replace(/\\/g, "/");
      const fileModel = new File(model);
      await fileModel.save();
      response.push({
        _id: fileModel._id,
        name: file.filename,
        path: fileModel.path,
      });
    }
    res.status(201).send(response);
  } catch (e) {
    console.log("e", e);
    res.status(500).send({ message: "internal error" });
  }
};

router.post(
  "/media",
  admin,
  publicUploader.array("files", 10),
  uploaderController
);

// get all images
router.get("/media/all", admin, async (req, res) => {
  try {
    const { page, category } = req.query;

    const myQuery = { category: category };
    const projection = {};

    const total = await File.find(myQuery, projection);

    const images = await File.find(myQuery, projection)
      .sort({ _id: -1 }).exec();
    res.status(200).send({
      data: images,
      total: total.length,
    });
  } catch (e) {
    console.log("e", e);
    res.status(500).send({ message: "internal error" });
  }
});

// delete one image by its id
router.delete("/media", admin, async (req, res) => {
  try {
    await File.findByIdAndRemove(req.body._id);
    // this is to remove the hostname from the path url
    const array = req.body.path.split('/');
    const fileName = array[array.length-1];
    // remove file from disk
    await unlink('media/'+fileName)
    res.status(200).send({ message: "Image was deleted successfully" });
  } catch (e) {
    res.status(400).send(e);
    console.log('e', e);
  }
});

export default router;
