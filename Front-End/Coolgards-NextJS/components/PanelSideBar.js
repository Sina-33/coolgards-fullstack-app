import styles from "./PanelSideBar.module.scss";
import Link from "next/link";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LocalMallOutlinedIcon from "@mui/icons-material/LocalMallOutlined";
import ColorLensOutlinedIcon from "@mui/icons-material/ColorLensOutlined";
import MonochromePhotosOutlinedIcon from "@mui/icons-material/MonochromePhotosOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReplyOutlinedIcon from "@mui/icons-material/ReplyOutlined";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import { useRouter } from "next/router";
import { useContext } from "react";
import { UserContext } from "../pages/_app";
import { Tooltip } from "@mui/material";

export default function PanelSideBar() {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const sekectionColor = "#230061FF";

  return (
    <nav className={styles.menu}>
      <div className={styles.adminName}>
        <p className="text-center text-lg font-light">
          {user?.fullName} ({user?.roles})
        </p>
      </div>
      <Tooltip title="Home">
        <Link
          className={styles.link}
          style={router.pathname === "/panel" ? { backgroundColor: sekectionColor } : {}}
          href="/panel"
        >
          <DashboardOutlinedIcon sx={{ marginRight: ".5rem" }} />
          Home
        </Link>
      </Tooltip>
      <Tooltip title="Users">
        <Link
          className={styles.link}
          style={
            router.pathname === "/panel/users" ? { backgroundColor: sekectionColor } : {}
          }
          href="/panel/users"
        >
          <PeopleAltOutlinedIcon sx={{ marginRight: ".5rem" }} />
          Users
        </Link>
      </Tooltip>
      <Tooltip title="News">
        <Link
          className={styles.link}
          style={
            router.pathname === "/panel/news" ? { backgroundColor: sekectionColor } : {}
          }
          href="/panel/news"
        >
          <AssignmentOutlinedIcon sx={{ marginRight: ".5rem" }} />
          News
        </Link>
      </Tooltip>
      <Tooltip title="Media">
        <Link
          className={styles.link}
          style={
            router.pathname === "/panel/media" ? { backgroundColor: sekectionColor } : {}
          }
          href="/panel/media"
        >
          <MonochromePhotosOutlinedIcon sx={{ marginRight: ".5rem" }} />
          Media
        </Link>
      </Tooltip>
      <Tooltip title="Products">
        <Link
          className={styles.link}
          style={
            router.pathname === "/panel/products"
              ? { backgroundColor: sekectionColor }
              : {}
          }
          href="/panel/products"
        >
          <ColorLensOutlinedIcon sx={{ marginRight: ".5rem" }} />
          Products
        </Link>
      </Tooltip>
      <Tooltip title="Messages">
        <Link
          className={styles.link}
          style={
            router.pathname === "/panel/messages"
              ? { backgroundColor: sekectionColor }
              : {}
          }
          href="/panel/messages"
        >
          <MailOutlinedIcon sx={{ marginRight: ".5rem" }} />
          Messages
        </Link>
      </Tooltip>

      <Tooltip title="Shipments">
        <Link
          className={styles.link}
          style={
            router.pathname === "/panel/shipments"
              ? { backgroundColor: sekectionColor }
              : {}
          }
          href="/panel/shipments"
        >
          <LocalShippingOutlinedIcon sx={{ marginRight: ".5rem" }} />
          Shipments
        </Link>
      </Tooltip>
      <Tooltip title="Orders">
        <Link
          className={styles.link}
          style={
            router.pathname === "/panel/orders"
              ? { backgroundColor: sekectionColor }
              : {}
          }
          href="/panel/orders"
        >
          <LocalMallOutlinedIcon sx={{ marginRight: ".5rem" }} />
          Orders
        </Link>
      </Tooltip>
      <Tooltip title="Back">
        <Link className={styles.link} href="/">
          <ReplyOutlinedIcon sx={{ marginRight: ".5rem" }} />
          Back
        </Link>
      </Tooltip>
    </nav>
  );
}
