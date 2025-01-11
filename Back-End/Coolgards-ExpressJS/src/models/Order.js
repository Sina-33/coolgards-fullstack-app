import mongoose, { Schema } from "mongoose";
import validator from "validator";

const orderSchema = new mongoose.Schema(
  {
    cart: [{
      _id: {
        type: String,
        required: true
      },
      quantity: {
        type: String,
        required: true
      },
      price: {
        type: String,
        required: true
      },
      slug: {
        type: String,
        required: true
      },
      title: {
        type: String,
        required: true
      },
      imageUrls: {
        type: [String],
        required: true,
      },

    }],
    userEmail: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    totalItems: {
      type: Number,
      required: true,
    },
    totalItemsPrice: {
      type: Number,
      required: true,
    },
    totalShipmentPrice: {
      type: Number,
      required: true,
    },
    totalVatPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    address: {
      fullName: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      mobilePhone: {
        type: String,
      },
    },
    paypalId: {
      type: String,
    },
    transactionInfo: {}
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
