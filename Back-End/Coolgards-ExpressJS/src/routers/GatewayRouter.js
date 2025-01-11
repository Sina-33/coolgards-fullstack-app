import express from "express";
import Order from "../models/Order.js";
import order from "../models/Order.js";
const router = new express.Router();



const { CLIENT_ID, APP_SECRET, PAYPAL_URL } = process.env;


// generate an access token using client id and app secret
async function generateAccessToken() {
  const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
  const response = await fetch(`${PAYPAL_URL}/v1/oauth2/token`, {
    method: "POST",
    body: "grant_type=client_credentials",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });
  const data = await response.json();
  return data.access_token;
}



// create a new order
router.post("/create-order", async (req, res) => {
  try {
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_URL}/v2/checkout/orders`;
    const foundOrder = await Order.findOne({_id: req.body.localOrderId})

    if (!foundOrder) {
      return res.status(400).send({ message: "Order Not Found" });
    }
    if (foundOrder.status !== "CREATED") {
      return res.status(400).send({ message: "order has been canceled or already paid" });
    }
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "EUR",
              value: foundOrder.totalPrice,
            },
          },
        ],
      }),
    });
    const order = await response.json();
    foundOrder.paypalId = order.id
    foundOrder.status = order.status
    await foundOrder.save();
    res.json(order);
  } catch (e) {
    console.log("e", e);
    res.status(400).send(e);
  }
});

// capture payment & store order information or fullFill order
router.post("/capture-order/:orderID", async (req, res) => {
  const { orderID } = req.params;

  const accessToken = await generateAccessToken();
  const url = `${PAYPAL_URL}/v2/checkout/orders/${orderID}/capture`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const captureData = await response.json();
  const foundOrder = await Order.findOne({paypalId: orderID})
  foundOrder.status = captureData.status;
  foundOrder.transactionInfo = captureData;
  await foundOrder.save();
  // TODO: store payment information such as the transaction ID
  res.json(captureData);
});

export default router;
