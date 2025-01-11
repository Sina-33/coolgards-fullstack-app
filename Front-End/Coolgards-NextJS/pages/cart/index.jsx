import * as React from "react";
import { useContext, useEffect, useRef, useState } from "react";
import { AlertContext, CartContext, UserContext } from "../_app";
import styles from "./cart.module.scss";
import Link from "next/link";
import { ax } from "../../utils/axios";
import { useRouter } from "next/router";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { Select } from "@mui/material";
import AddButton from "../../components/AddButton";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import TextField from "@mui/material/TextField";
import ShoppingCartCheckoutIcon from "@mui/icons-material/ShoppingCartCheckout";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";

export default function Cart({ shipments }) {
  const router = useRouter();
  const { user, setUser } = useContext(UserContext);
  const [mode, setMode] = useState(0);
  const [disableButton, setDisableButton] = useState(false);

  const [query, setQuery] = useState(user);

  const { setMessage, setError } = useContext(AlertContext);
  const { cart } = useContext(CartContext);
  const [refreshedCart, setRefreshedCart] = useState([]);
  const [shipmentPlan, setShipmentPlan] = useState(shipments[0]._id);

  useEffect(() => {
    if (user) {
      setQuery(user)
      const userShipmentPlan = shipments.filter(
        (item) => item.country === user.country
      );
      if (userShipmentPlan.length !== 0) {
        setShipmentPlan(userShipmentPlan[0]._id);
      }
    }
  }, [user, shipments]);

  const [orderInfo, setOrderInfo] = useState({
    totalItems: "",
    totalItemsPrice: "",
    totalPrice: "",
  });
  const userFormElement = useRef();

  const handleChange = (e) => {
    setQuery({ ...query, [e.target.name]: e.target.value });
  };

  const refreshCart = () => {
    const model = {
      cart,
      shipmentPlan,
    };
    ax.post("/api/cart", model)
      .then((res) => {
        setRefreshedCart(res.data.cart);
        setOrderInfo(res.data.orderInfo);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  // initial cart refresh
  useEffect(() => {
    if (cart.length !== 0) {
      refreshCart();
    }
  }, []);

  // refresh cart on cart or shipment plan change
  useEffect(() => {
    refreshCart();
  }, [cart, shipmentPlan]);

  const getCurrentUser = () => {
    ax.get("/api/users/me")
      .then((res) => {
        setUser(res.data.data);
        setQuery(res.data.data);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
        localStorage.removeItem("authenticated");
      });
  };

  useEffect(() => {
    if (mode === 1 || mode === 2) {
      userFormElement.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [mode]);

  const submitEdit = async () => {
    const { roles, ...rest } = query;
    if (!query.fullName) {
      return setError("Please enter your full name");
    }
    if (!query.city) {
      return setError("Please enter your city name");
    }
    if (!query.address) {
      return setError("Please enter your address");
    }
    if (!query.postalCode) {
      return setError("Please enter your postal code");
    }
    ax({
      url: "/api/users/me",
      method: "patch",
      data: rest,
    })
      .then((res) => {
        setMessage(res.data.message);
        getCurrentUser();
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const makeOrder = async () => {
    const model = {
      cart: refreshedCart,
      shipmentPlan,
      userInfo: mode === 1 ? user : query,
    };

    ax({
      url: "/api/orders",
      method: "post",
      data: model,
    })
      .then((res) => {
        setMessage(res.data.message);
        setDisableButton(true);
        router.push('/checkout/'+ res.data.data._id)
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  const makeAnonymousOrder = async () => {
    if (!query.email) {
      return setError("Please enter your email address");
    }

    if (!query.fullName) {
      return setError("Please enter your full name");
    }

    if (!query.password) {
      return setError("Please enter your password");
    }
    if (query.password.length < 7) {
      return setError("Please choose a stronger password (at least seven characters)");
    }

    if (!query.city) {
      return setError("Please enter your city name");
    }
    if (!query.address) {
      return setError("Please enter your address");
    }
    if (!query.postalCode) {
      return setError("Please enter your postal code");
    }
    makeOrder();
  };

  const placeOrder = () => {
    if (user) {
      setQuery(user);
      setMode(1);
    } else {
      setMode(2);
    }
  };

  const handleSubmit = async () => {
    if (mode === 1) {
      submitEdit()
        .then(() => makeOrder())
        .catch((e) => setError(e.messaage));
    }
    if (mode === 2) {
      makeAnonymousOrder();
    }
  };

  const renderUserForm = () => {
    if (mode === 0) {
      return "";
    }
    if (mode === 1 || mode === 2) {
      return (
        <div className={styles.userContainer} ref={userFormElement}>
          <div className="flex justify-center items-start flex-wrap">
            {mode === 2 && (
              <div className="flex justify-center w-[100%] items-center flex-col">
                <p className="font-bold">
                  if you already have an account please{" "}
                  <Link
                    style={{ color: "rgba(40,126,255,0.99)" }}
                    href={{
                      pathname: "/login",
                      query: {redirect: "/cart"},
                    }}
                  >
                    Log in!
                  </Link>
                </p>
                <p>otherwise please fill this form to create an account</p>
              </div>
            )}
            <TextField
              required
              value={query?.email}
              label="Email"
              variant="standard"
              name="email"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
              disabled={mode === 1}
            />
            <TextField
              required
              value={query?.fullName}
              label="Full Name"
              variant="standard"
              name="fullName"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />
            {mode === 2 && (
              <TextField
                required
                value={query?.password}
                label="Password"
                variant="standard"
                name="password"
                onChange={handleChange}
                sx={{ width: 300, margin: 2 }}
              />
            )}

            <Select
              variant="standard"
              value={
                shipments.filter((shipment) => shipment._id === shipmentPlan)[0]
                  ?.country
              }
              sx={{ margin: "2rem", width: 300 }}
              label="Country"
              name="country"
              disabled
              required
            >
              {shipments.map((item) => (
                <MenuItem key={item._id} value={item.country}>
                  {item.country}
                </MenuItem>
              ))}
            </Select>

            <TextField
              required
              value={query?.city}
              label="City"
              variant="standard"
              name="city"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />

            <TextField
              required
              value={query?.address}
              label="Address"
              variant="standard"
              name="address"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />

            <TextField
              value={query?.postalCode}
              label="Postal Code"
              variant="standard"
              name="postalCode"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />

            <TextField
              value={query?.mobilePhone}
              label="Mobile Phone"
              variant="standard"
              name="mobilePhone"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />
          </div>
          <div className="flex w-[100%] justify-center items-start">
            <Button
              sx={{ margin: 2 }}
              onClick={handleSubmit}
              variant="contained"
              startIcon={<ShoppingCartCheckoutIcon />}
              disabled={disableButton}
            >
              CheckOut
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.cartContainer}
      >
        <div className="bg-white">
          <div className="flex justify-between border-b mx-10">
            <h1 className="font-semibold text-2xl">Shopping Cart</h1>
            <h2 className="font-semibold text-2xl">
              {orderInfo.totalItems} Items
            </h2>
          </div>
          <div className={styles.titlesContainer}>
            <h3 className="font-semibold text-gray-600 text-xs uppercase w-[22rem] ml-10">
              Product Details
            </h3>
            <h3 className="font-semibold text-center text-gray-600 text-xs uppercase align-middle w-[5rem] text-center">
              Quantity
            </h3>
            <h3 className="font-semibold text-center text-gray-600 text-xs uppercase align-middle w-[5rem] text-center">
              Price
            </h3>
            <h3 className="font-semibold text-center text-gray-600 text-xs uppercase align-middle w-[5rem] text-center">
              Total
            </h3>
          </div>

          {/*start*/}
          {refreshedCart.map((item) => {
            return (
              <div
                key={item?._id}
                className="flex shadowCard flex-wrap items-center hover:bg-gray-100 p-6"
              >
                <Link
                  className="flex items-center w-[20rem]"
                  href={"/products/" + item.slug}
                >
                  <div>
                    <img
                      className="h-24"
                      src={item?.imageUrls[0]}
                      alt={item?.title}
                    />
                  </div>
                  <div className="flex flex-col justify-between ml-4 flex-grow">
                    <p className="font-bold m-3 text-sm">{item?.title}</p>
                  </div>
                </Link>
                <div className="flex items-center justify-center">
                  <AddButton data={item} />
                  <p className="text-center w-15 font-semibold text-sm">
                    € {item?.price}
                  </p>
                  <p className="text-center  w-15  font-semibold text-sm">
                    € {item.price * item.quantity}
                  </p>
                </div>
              </div>
            );
          })}

          {/*end*/}

          <Link href="/products">
            <Button
              variant="standard"
              sx={{ margin: "1rem", fontSize: "1rem" }}
            >
              <ReplyOutlinedIcon sx={{ marginRight: "1rem" }} />
              Continue Shopping
            </Button>
          </Link>
        </div>

        <div className="shadowCard w-[20rem] px-8 py-2">
          <h1 className="font-semibold text-2xl border-b pb-8">
            Order Summary
          </h1>
          <div className="flex justify-between mt-10 mb-5">
            <span className="font-semibold text-sm uppercase">
              Total Items <b className="ml-2">( {orderInfo?.totalItems})</b>
            </span>
            <span className="font-semibold text-sm">
              € {orderInfo.totalItemsPrice}
            </span>
          </div>
          <div className={styles.shippingContainer}>
            <label className="font-medium inline-block text-sm uppercase">
              Location
            </label>
            <Select
              label="Shipping"
              variant="standard"
              name="shipping"
              value={shipmentPlan}
              onChange={(e) => setShipmentPlan(e.target.value)}
            >
              {shipments?.map((shipment) => {
                return (
                  <MenuItem key={shipment._id} value={shipment._id}>
                    {shipment?.country} - € {shipment?.shipmentPrice}
                  </MenuItem>
                );
              })}
            </Select>
          </div>
          <div className="flex font-semibold justify-between mb-4  text-sm uppercase">
            <span>
              Shipping{" "}
              <b>
                (€{" "}
                {
                  shipments.filter(
                    (shipment) => shipment._id === shipmentPlan
                  )[0]?.shipmentPrice
                }
                )
              </b>{" "}
            </span>
            <span>+ € {orderInfo.totalShipmentPrice}</span>
          </div>
          <div className="flex font-semibold justify-between mb-4 text-sm uppercase">
            <span>
              Vat{" "}
              <b>
                (%{" "}
                {
                  shipments.filter(
                    (shipment) => shipment._id === shipmentPlan
                  )[0]?.vat
                }
                )
              </b>{" "}
            </span>
            <span>+ € {orderInfo.totalVatPrice}</span>
          </div>
          <div className="flex font-semibold justify-between mb-4  text-sm uppercase">
            <span>Total cost</span>
            <span>€ {orderInfo.totalPrice}</span>
          </div>
          <Button
            sx={{ margin: "1.5rem 0rem" }}
            variant="contained"
            fullWidth
            startIcon={<EventNoteOutlinedIcon />}
            onClick={placeOrder}
          >
            Place Order
          </Button>
        </div>
      </div>

      {/*customer details*/}

      {renderUserForm()}
    </div>
  );
}

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.BASE_URL}/shipments`);
    const jsonRes = await res.json();
    return { props: { shipments: jsonRes.data } };
  } catch (err) {
    return { props: { error: err.response?.data?.message || err.message } };
  }
}
