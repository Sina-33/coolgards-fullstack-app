import * as React from "react";
import { useContext, useState } from "react";
import { AlertContext } from "../_app";
import styles from "./products.module.scss";
import Link from "next/link";
import Button from "@mui/material/Button";
import AddButton from "../../components/AddButton";

export default function Products({ data, error }) {
  const { setError } = useContext(AlertContext);


  if (error) {
    setError(error);
  }

  return (
      <div className = {styles.mainContainer}>
        <h1 className={styles.mainTitle}>Our Products</h1>
        <div className={styles.container}>
          {data.data?.map((item) => {
            return (
                <div
                    key={item._id}
                    className={styles.card}
                >
                  <img
                      src={item?.imageUrls[0]}
                      alt={item?.title}
                      className={styles.image}
                  />
                  <div className={styles.details}>
                    <h1 className={styles.title}>{item.title}</h1>
                    <p className={styles.price}>€{item.price}</p>
                    <div className={styles.buttonContainer}>
                      <AddButton data={item}/>
                      <Link href={"/products/" + item.slug}>
                        <Button fullWidth variant="standard" sx={{ margin: ".5rem", fontSize: ".8rem", height: "50px" }}>
                          read more
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
      </div>

  );
}

export async function getServerSideProps() {
  try {
    const res = await fetch(`${process.env.BASE_URL}/products`);
    const data = await res.json();
    return { props: { data: data } };
  } catch (err) {
    return { props: { error: err.response?.data?.message || err.message } };
  }
}
