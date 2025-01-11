import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    country: {
      type: String,
      required: true,
    },
    shipmentPrice: {
      type: Number,
      required: true,
    },
    vat: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Shipment", schema);

export default Message;
