import React, { useContext, useEffect, useState } from "react";
import styles from "./panel.module.scss";
import { ax } from "../../utils/axios";
import { AlertContext } from "../_app";
import { Divider } from "@mui/material";
import Link from "next/link";

export default function Panel() {
  const { setError } = useContext(AlertContext);
  const [data, setData] = useState({
    newUsersCount: "",
    totalUsersCount: "",
    newNewsCount: "",
    totalNewsCount: "",
    newProductsCount: "",
    totalProductsCount: "",
    newMessagesCount: "",
    totalMessagesCount: "",
    newOrdersCount: "",
    totalOrdersCount: "",
  });

  const getData = () => {
    ax({
      url: "/api/panel/general/dashboard",
    })
      .then((res) => {
        setData(res.data);
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
  };
  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="panelContainer">
      <div className="flex justify-center">
        <h1 className="font-thin	text-gray-400	">Dashboard</h1>
      </div>
      <div className={styles.container}>
        <Link href="/panel/users">
          <div className={styles.card}>
            <p>Users</p>
            <Divider />
            <p>
              <span className={styles.count}>{data.newUsersCount}</span> in last
              24hr
            </p>
            <p>
              <span className={styles.count}>{data.totalUsersCount}</span> in
              total
            </p>
          </div>
        </Link>

        <Link href="/panel/products">
          <div className={styles.card}>
            <p>Products</p>
            <Divider />
            <p>
              <span className={styles.count}>{data.newProductsCount}</span> in
              last 24hr
            </p>
            <p>
              <span className={styles.count}>{data.totalProductsCount}</span> in
              total
            </p>
          </div>
        </Link>

        <Link href="/panel/news">
          <div className={styles.card}>
            <p>News</p>
            <Divider />
            <p>
              <span className={styles.count}>{data.newNewsCount}</span> in last
              24hr
            </p>
            <p>
              <span className={styles.count}>{data.totalNewsCount}</span> in
              total
            </p>
          </div>
        </Link>

        <Link href="/panel/news">
          <div className={styles.card}>
            <p>Messages</p>
            <Divider />
            <p>
              <span className={styles.count}>{data.newMessagesCount}</span> in
              last 24hr
            </p>
            <p>
              <span className={styles.count}>{data.totalMessagesCount}</span> in
              total
            </p>
          </div>
        </Link>

        <Link href="/panel/orders">
          <div className={styles.card}>
            <p>Orders</p>
            <Divider />
            <p>
              <span className={styles.count}>{data.newOrdersCount}</span> in
              last 24hr
            </p>
            <p>
              <span className={styles.count}>{data.totalOrdersCount}</span> in
              total
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
