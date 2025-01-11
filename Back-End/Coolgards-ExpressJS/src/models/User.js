import mongoose, { Schema } from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is invalid");
        }
      },
    },
    roles: {
      type: [String],
      default: ["customer"],
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 7,
      trim: true,
      validate(value) {
        if (value.toLowerCase().includes("password")) {
          throw new Error('Password cannot contain "password"');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
        useragent: Schema.Types.Mixed,
      },
    ],
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    address: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    mobilePhone: {
      type: String,
    },
    resetCode: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.resetCode;

  return userObject;
};

userSchema.methods.generateAuthToken = async function (useragent) {
  try {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.SECRET, {
      expiresIn: "7d",
    });
    user.tokens = user.tokens.concat({ token, useragent });
    await user.save();
    return token;
  } catch (e) {
    console.log("e", e);
  }
};


const User = mongoose.model("User", userSchema);

export default User;
