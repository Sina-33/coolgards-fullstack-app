import * as React from "react";
import { useContext } from "react";
import { AlertContext } from "../_app";
import styles from "./product.module.scss";
import ImageGallery from "react-image-gallery";
import parse from "html-react-parser";
import Button from "@mui/material/Button";
import Link from "next/link";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import AddButton from "../../components/AddButton";

export default function Product({ data, error }) {
  const { setError } = useContext(AlertContext);

  const sliderItemsGenerator = (urls) => {
    return urls.map((url) => {
      return {
        original: url,
        thumbnail: url,
        thumbnailClass: styles.shadow,
      };
    });
  };

  if (error) {
    setError(error);
  }

  return (
    <div className={styles.container}>
      <article>
        <div className={styles.header}>
          <div className={styles.sliderContainer}>
            <ImageGallery
              className={styles.slider}
              showPlayButton={false}
              items={sliderItemsGenerator(data?.data?.imageUrls)}
            />
          </div>
          <div className={styles.headerDetails}>
            <h1 className={styles.title}>{data?.data?.title}</h1>
            <p className={styles.price}>€{data?.data?.price}</p>
            <AddButton data={data?.data} />
          </div>
        </div>

        <div className={styles.content}>
          <div className="m-8">{parse(data?.data.content)}</div>
        </div>
        <div className={styles.tagContainer}>
          {data?.data.tags.map((tag) => {
            return (
              <p className={styles.tags} key={tag}>
                {" "}
                {tag}
              </p>
            );
          })}
        </div>
        <div>
          <Link href="/products">
            <Button
              fullWidth
              variant="standard"
              sx={{ margin: "1rem", fontSize: "1.5rem" }}
            >
              <ReplyOutlinedIcon sx={{ marginRight: "1rem" }} />
              Go Back to Store
            </Button>
          </Link>
        </div>
      </article>
    </div>
  );
}

export async function getServerSideProps(context) {
  try {
    const res = await fetch(
      `${process.env.BASE_URL}/products/${context.params.slug}`
    );
    const data = await res.json();
    return { props: { data } };
  } catch (err) {
    return { props: { error: err.response?.data?.message || err.message } };
  }
}
