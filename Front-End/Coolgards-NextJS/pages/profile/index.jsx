import * as React from "react";
import { useContext, useEffect, useState } from "react";
import { AlertContext, UserContext } from "../_app";
import styles from "./profile.module.scss";
import { useRouter } from "next/router";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import { ax } from "../../utils/axios";
import Image from "next/image";

export default function Profile({ shipments }) {
  const router = useRouter();
  const { user, setUser } = useContext(UserContext);
  const [modal, setModal] = useState(false);
  const { setError, setMessage } = useContext(AlertContext);
  const [editQuery, setEditQuery] = useState(user);

  useEffect(() => {
    if (!localStorage.getItem("authenticated")) {
      router.push("/login");
    }
  }, []);

  const cancelEdit = () => {
    setModal(false);
  };
  const handleCloseModal = () => {
    setModal(false);
  };
 const handleEdit = () => {
   setEditQuery(user)
    setModal(true);
  };

  const handleChange = (e) => {
    setEditQuery({ ...editQuery, [e.target.name]: e.target.value });
  };

  const getCurrentUser = () => {
        ax.get('/api/users/me').then((res) => {
          setUser(res.data.data);
          setEditQuery(res.data.data);
        }).catch((e) => {
          setError(e.response?.data?.message || e.message)
          localStorage.removeItem('authenticated')
        })
  }

  const submitEdit = () => {
    const {orders, roles, ...rest} = editQuery;
    ax({
      url: "/api/users/me",
      method: "patch",
      data: rest,
    })
      .then((res) => {
        cancelEdit();
        setMessage(res.data.message);
        getCurrentUser()
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };

  return (
    <div className={styles.container}>
      <div className={styles.profileContainer}>
        <div className={styles.iconContainer}>
          <span className={styles.line}/>
          <Image src='/avatar.png' width={80} height={80} alt="user avatar"/>
          <span className={styles.line}/>
        </div>
        <div className={styles.profileItem}>
          <span className={styles.label}>Full Name</span>
          <span className={styles.value}>{user.fullName}</span>
        </div>

        <div className={styles.profileItem}>
          <span className={styles.label}>Email</span>
          <span className={styles.value}>{user.email}</span>
        </div>

        <div className={styles.profileItem}>
          <span className={styles.label}>Mobile Phone</span>
          <span className={styles.value}>{user.mobilePhone}</span>
        </div>

        <div className={styles.iconContainer}>
          <span className={styles.line}/>
          <Image src='/address.png' width={80} height={80} alt="user address"/>
          <span className={styles.line}/>
        </div>

        <div className={styles.profileItem}>
          <span className={styles.label}>Country</span>
          <span className={styles.value}>{user.country}</span>
        </div>

        <div className={styles.profileItem}>
          <span className={styles.label}>City</span>
          <span className={styles.value}>{user.city}</span>
        </div>


        <div className={styles.profileItem}>
          <span className={styles.label}>Postal Code</span>
          <span className={styles.value}>{user.postalCode}</span>
        </div>


        <div className={styles.profileItem}>
          <span className={styles.label}>Address</span>
          <span className={styles.value}>{user.address}</span>
        </div>

        <Button sx={{margin: '1.5rem 0rem'}} variant="contained" fullWidth onClick={handleEdit}>Edit Profile</Button>


        <div className={styles.iconContainer}>
          <span className={styles.line}/>
          <Image src='/orders.png' width={80} height={80} alt="user address"/>
          <span className={styles.line}/>
        </div>


      </div>

      {/*edit modal*/}
      <Modal open={modal} onClose={handleCloseModal}>
        <div className="modal">
          <div className="flex justify-center items-start flex-wrap">
            <TextField
              required
              value={editQuery.email}
              label="Email"
              variant="standard"
              name="email"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />
            <TextField
              required
              value={editQuery.fullName}
              label="Full Name"
              variant="standard"
              name="fullName"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />
            <TextField
              required
              value={editQuery.password}
              label="Password"
              variant="standard"
              name="password"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />

            <Select
              variant="standard"
              value={editQuery.country}
              sx={{ margin: "2rem", width: 300 }}
              label="Country"
              name="country"
              onChange={handleChange}
            >
              {shipments.map((item) => (
                <MenuItem key={item._id} value={item.country}>
                  {item.country}
                </MenuItem>
              ))}
            </Select>

            <TextField
              value={editQuery.city}
              label="City"
              variant="standard"
              name="city"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />

            <TextField
              value={editQuery.address}
              label="Address"
              variant="standard"
              name="address"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />

            <TextField
              value={editQuery.postalCode}
              label="Postal Code"
              variant="standard"
              name="postalCode"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />

            <TextField
              value={editQuery.mobilePhone}
              label="Mobile Phone"
              variant="standard"
              name="mobilePhone"
              onChange={handleChange}
              sx={{ width: 300, margin: 2 }}
            />
          </div>
          <div className="flex justify-center items-start">
            <Button
              sx={{ margin: 2 }}
              onClick={submitEdit}
              variant="contained"
              startIcon={<ManageAccountsOutlinedIcon />}
            >
              Edit Profile
            </Button>
            <Button sx={{ margin: 2 }} onClick={cancelEdit} variant="contained">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
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
