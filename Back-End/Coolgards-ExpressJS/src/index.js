import "./envConfigs.js";
import express from "express";
import cors from "./middleware/Cors.js";
import cookieParser from "cookie-parser";
import useragent from "express-useragent";
import "./db/Mongoose.js";
import "./mail/Transporter.js";
import userRouter from "./routers/UserRouter.js";
import fileRouter from "./routers/FileRouter.js";
import postRouter from "./routers/PostRouter.js";
import shipmentRouter from "./routers/ShipmentRouter.js";
import productRouter from "./routers/ProductRouter.js";
import messageRouter from "./routers/MessageRouter.js";
import generalRouter from "./routers/GeneralRouter.js";
import gatewayRouter from "./routers/GatewayRouter.js";
import orderRouter from "./routers/OrderRouter.js";
import "./seeders/UserSeeder.js";
import { sendMail } from "./mail/Transporter.js";

const app = express();
app.use(cors);
app.use(cookieParser(process.env.SECRET));

app.use(useragent.express());
// allow json body
app.use(express.json());
app.use(userRouter);
app.use(fileRouter);
app.use(postRouter);
app.use(productRouter);
app.use(messageRouter);
app.use(generalRouter);
app.use(shipmentRouter);
app.use(gatewayRouter);
app.use(orderRouter);
app.use("/media/", express.static("media"));
app.get("/", (req, res) => {
  res.send("Hii");

});

app.listen(process.env.PORT, () => {
  console.log(`listening on port ${process.env.PORT}...`);
});
