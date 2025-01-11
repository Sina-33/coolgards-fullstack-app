import Button from "@mui/material/Button";
import * as React from "react";
import { useContext } from "react";
import { AlertContext, CartContext } from "../pages/_app";
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from "@mui/material/IconButton";
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';
export default function AddButton({ data }) {
  const { cart, setCart } = useContext(CartContext);
  const { setMessage } = useContext(AlertContext);

  const renderButton = () => {
    for (const item of cart) {
      if (item._id === data._id) {
        return (
          <div className="flex items-center">
            {item.quantity <= 1? <IconButton
                onClick={removeFromCart}
                variant="contained"
                size='large'
                sx={{ margin: ".5rem", height: "2rem", minWidth: "1rem" }}
                color="error"
            >
              <DeleteIcon />
            </IconButton> :  <IconButton
                onClick={decreaseFromCart}
                variant="contained"
                size='large'
                sx={{ margin: ".5rem", height: "2rem", minWidth: "1rem" }}
            >
              <IndeterminateCheckBoxOutlinedIcon/>
            </IconButton>}
            <p>{item.quantity}</p>
            <IconButton
              onClick={addToCart}
              variant="contained"
              size='large'
              sx={{ margin: ".5rem", height: "2rem", minWidth: "1rem" }}
            >
              <AddBoxOutlinedIcon />
            </IconButton>
          </div>
        );
      }
    }
    return (
      <Button
        onClick={addToCart}
        variant="contained"
        sx={{ margin: ".5rem", height: "50px" }}
      >
        Add to Cart
      </Button>
    );
  };

  const addToCart = () => {
    if (typeof window !== "undefined") {
      if (cart?.length === 0) {
        setCart([{ ...data, quantity: 1 }]);
        localStorage.setItem(
          "cart",
          JSON.stringify([{ ...data, quantity: 1 }])
        );
        setMessage("Product was added to the cart successfully");
      } else {
        let repeated = false;
        const newData = cart.map((item) => {
          if (item._id === data._id) {
            item.quantity = item.quantity + 1;
            repeated = true;
          }
          return item;
        });
        if (repeated) {
          setCart(() => newData);
          localStorage.setItem("cart", JSON.stringify(newData));
          setMessage("Product quantity increased");

          repeated = false;
        } else {
          if (!data.quantity) {
            data.quantity = 1;
          }
          setCart((prev) => [...prev, data]);
          localStorage.setItem("cart", JSON.stringify([...cart, data]));

          setMessage("Product was added to the cart successfully");
        }
      }
    }
  };

  const removeFromCart = () => {
    const newData = cart.filter((item) => item._id !== data._id)
    setCart(() => newData);
  };

  const decreaseFromCart = () => {
    let repeated = false;
    const newData = cart.map((item) => {
      if (item._id === data._id) {
        item.quantity = item.quantity - 1;
        repeated = true;
      }
      return item;
    });
    if (repeated) {
      setCart(() => newData);
      setMessage("Product quantity decreased");
      repeated = false;
    } else {
      setCart((prev) => [...prev, data]);
      setMessage("Product was removed from the cart successfully");
    }
  };
  return <>{renderButton()}</>;
}
