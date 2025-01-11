import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { AlertContext } from "../_app";
import styles from "./contact.module.scss";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { ax } from "../../utils/axios";

export default function Contact({ data, error }) {
  const { setError, setMessage } = useContext(AlertContext);
  const [ sent, setSent ] = useState(false);

  if (error) {
    setError(error);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const model = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone"),
      subject: data.get("subject"),
      content: data.get("content"),
    };
    ax.post("/api/panel/messages", model)
      .then((res) => {
        setMessage("Message received successfully thank you");
        setSent(true)
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.contactContainer}>
        {sent? <div className={styles.form}>
          <p>Thank you! we have received your message</p>
          <p>we will reach you soon!</p>
              <Button
                  onClick={() => setSent(false)}
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
              >
                Send another message?
              </Button>
        </div>:
        <form onSubmit={handleSubmit} className={styles.form}>
          <h1 className={styles.title}>Contact us</h1>
          <TextField
            margin="normal"
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            autoComplete="name"
            autoFocus
          />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                />
                <TextField
                    margin="normal"
                    fullWidth
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    autoComplete="phone"
                />

          <TextField
            margin="normal"
            required
            fullWidth
            id="subject"
            label="Subject"
            name="subject"
          />
          <TextField
            margin="normal"
            rows={6}
            required
            fullWidth
            id="content"
            label="Message"
            name="content"
            multiline
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Submit Message
          </Button>
        </form>}
      </div>
    </div>
  );
}
