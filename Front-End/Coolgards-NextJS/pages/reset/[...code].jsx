import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { AlertContext, UserContext } from "../_app";
import styles from "./reset.module.scss";
import { useRouter } from "next/router";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { ax } from "../../utils/axios";

export default function Forgot({ data, error }) {
  const router = useRouter();
  const { setError, setMessage } = useContext(AlertContext);
  const [password, setPassword] = useState("");
  const [sent, setSend] = useState(false);
  const [errorMode, setErrorMode] = useState(false);

  useEffect(() => {
    if (error) {
      setError(error);
      setErrorMode(true);
    }
  }, [error]);

  const handleChange = (e) => {
    setPassword(e.target.value);
  };

  const handleResetPassword = () => {
    if (!password) {
      setMessage("Please enter a valid password");

    } else {
        const model = {
            password,
            id: data.data.id,
            code: data.data.code,
        };
      ax.get("/api/forgot", model)
        .then((res) => {
          setMessage(res.data.message);
          setSend(true);
        })
        .catch((e) => {
          setError(e.response?.data?.message || e.message);
          localStorage.removeItem("authenticated");
        });
    }
  };

  const handleRedirectToLogin = () => {
    router.push("/login");
  };

  const renderComponent = () => {
    if (errorMode) {
      return (
        <>
          <p className={styles.title3}>Your reset link has expired</p>
          <Button
            onClick={handleRedirectToLogin}
            variant="contained"
            sx={{ margin: ".5rem", height: "50px" }}
          >
            Get Back to Login page!
          </Button>
        </>
      );
    }
    if (sent) {
      return (
        <>
          <p className={styles.title2}>Password Was Changed Successfully</p>
          <Button
            onClick={handleRedirectToLogin}
            variant="contained"
            sx={{ margin: ".5rem", height: "50px" }}
          >
            Login Now!
          </Button>
        </>
      );
    }
    return (
      <>
        <p className={styles.title}>Please enter your new password</p>
        <TextField
          required
          value={password}
          label="Please enter your new password"
          name="password"
          onChange={handleChange}
          fullWidth
          sx={{ width: 300, margin: 2 }}
        />
        <Button
          onClick={handleResetPassword}
          variant="contained"
          sx={{ margin: ".5rem", height: "50px" }}
        >
          Change Password
        </Button>
      </>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.passwordContainer}>{renderComponent()}</div>
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/reset/${context.params.code[0]}/${context.params.code[1]}`
    );
    if (!res.ok) {
      return { props: { error: res.statusText } };
    } else {
      const data = await res.json();
      return { props: { data } };
    }
  } catch (err) {
    return { props: { error: err.response?.data?.message || err.message } };
  }
}
