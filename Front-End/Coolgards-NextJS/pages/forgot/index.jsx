import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { AlertContext, UserContext } from "../_app";
import styles from "./forgot.module.scss";
import { useRouter } from "next/router";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { ax } from "../../utils/axios";

export default function Forgot({data}) {
  const router = useRouter();
  const {setError, setMessage} = useContext(AlertContext)

  const [email, setEmail] = useState("");
  const [sent, setSend] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleResetPassword = () => {
    if (!email) {
      setMessage('Please enter a valid email')
    } else {
      ax.post("/api/forgot", {email})
          .then((res) => {
            setMessage(res.data.message)
            setSend(true)
          })
          .catch((e) => {
            setError(e.response?.data?.message || e.message);
            localStorage.removeItem("authenticated");
          });
    }

  };

  return (
    <div className={styles.container}>
      <div className={styles.emailContainer}>
        {sent?         <p className={styles.title2}>Please Check Your Email!</p>
         : <> <p className={styles.title}>Please enter your email to get the reset link</p>
              <TextField
                  required
                  value={email}
                  label="Please enter your  email"
                  name="email"
                  onChange={handleChange}
                  fullWidth
                  sx={{ width: 300, margin: 2 }}
              />
              <Button
                  onClick={handleResetPassword}
                  variant="contained"
                  sx={{ margin: ".5rem", height: "50px" }}
              >
                Reset Password
              </Button></>}

      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const res = await fetch(
        `${process.env.BASE_URL}/reset-password/${context.params.slug}`
    );
    const data = await res.json();

    return { props: { data } };
  } catch (err) {
    return { props: { error: err.response?.data?.message || err.message } };
  }
}
