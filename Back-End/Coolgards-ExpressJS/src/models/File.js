import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: String,
    encoding: String,
    mimetype: String,
    path: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    category: String,
    user: String,
    order: String,
    product: String,
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", schema);

export default File;
