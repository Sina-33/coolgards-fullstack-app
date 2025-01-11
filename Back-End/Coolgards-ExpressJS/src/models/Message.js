import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: String,
    email: {
      type: String,
      required: true,
    },
    phone: String,
    subject: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "unread",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", schema);

export default Message;
