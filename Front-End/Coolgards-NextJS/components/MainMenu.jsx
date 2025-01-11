import { useContext, useState } from "react";
import { AlertContext, CartContext, UserContext } from "../pages/_app";
import Link from "next/link";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Badge from "@mui/material/Badge";
import { ax } from "../utils/axios";
import Logout from "@mui/icons-material/Logout";
import ListItemIcon from "@mui/material/ListItemIcon";
import Settings from "@mui/icons-material/Settings";
import Avatar from "@mui/material/Avatar";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import Image from "next/image";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import styles from "./MainMenu.module.scss";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import { useRouter } from "next/router";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PersonIcon from "@mui/icons-material/Person";
import { Divider } from "@mui/material";
import VpnKeyOutlinedIcon from "@mui/icons-material/VpnKeyOutlined";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";

export default function MainMenu() {
  const router = useRouter();
  const { user, setUser } = useContext(UserContext);
  const { cart } = useContext(CartContext);
  const { setError, setMessage } = useContext(AlertContext);
  const [showHam, setShowHam] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    ax.post("/api/users/logout")
      .then((res) => {
        router.push('/')
        setMessage(res.data.message);
        document.cookie = 'COOKIE_NAME=cookieToken; Max-Age=0; path=/; domain=' + location.host;
        localStorage.removeItem("authenticated");
        setUser("");
      })
      .catch((e) => {
        setError(e.response?.data?.message || e.message);
      });
    setAnchorEl(null);
  };

  return (
    <nav className="flex glass2 fixed top-3 left-8 max-sm:left-2 right-8 max-sm:right-2 p-0 h-[4rem] items-center justify-between ">
      <div className={styles.ham} onClick={() => setShowHam(!showHam)}>
        {showHam ? <ListOutlinedIcon /> : <MenuOutlinedIcon />}
      </div>
      <MenuItem sx={{ borderRadius: "2rem", marginRight: ".4rem" }}>
        <Link href="/" onClick={() => setShowHam(false)}>
          <div className="flex ml-4 max-sm:ml-0 justify-center flex-1 items-center">
            <Image
                src="/logo.png"
                alt="coolgards logo"
                width={60}
                height={60}
            />
            <p className="mr-2 max-sm:mr-0 text-logo text-[1.1rem] max-sm:text-[.9rem]  ">CoolGards</p>
          </div>
        </Link>
      </MenuItem>
      <div className={showHam ? styles.menu2 : styles.menu}>


        <Link href="/products" onClick={() => setShowHam(false)}>
          <MenuItem
            sx={
              router.pathname === "/products"
                ? { backgroundColor: "#00a2ea", borderRadius: "2rem" }
                : { borderRadius: "2rem" }
            }
          >
            Products
          </MenuItem>
        </Link>

        <Link href="/news" onClick={() => setShowHam(false)}>
          <MenuItem
            sx={
              router.pathname === "/news"
                ? { backgroundColor: "#00a2ea", borderRadius: "2rem" }
                : { borderRadius: "2rem" }
            }
          >
            News
          </MenuItem>
        </Link>

        <Link href="/about" onClick={() => setShowHam(false)}>
          <MenuItem
            sx={
              router.pathname === "/about"
                ? { backgroundColor: "#00a2ea", borderRadius: "2rem" }
                : { borderRadius: "2rem" }
            }
          >
            About
          </MenuItem>
        </Link>
        <Link href="/contact" onClick={() => setShowHam(false)}>
          <MenuItem
            sx={
              router.pathname === "/contact"
                ? { backgroundColor: "#00a2ea", borderRadius: "2rem" }
                : { borderRadius: "2rem" }
            }
          >
            Contact Us
          </MenuItem>
        </Link>
      </div>

      <div className="flex justify-end mr-8 flex-1">
        <MenuItem sx={{ borderRadius: "2rem" }}>
          <Link href="/cart">
            <Badge badgeContent={cart?.length} color="primary">
              <ShoppingCartOutlinedIcon color="action" />
            </Badge>
          </Link>
        </MenuItem>
      </div>

      {user ? (
        <>
          <MenuItem
            sx={{ borderRadius: "2rem" }}
            onClick={handleClick}
          >
            <PersonIcon />
          </MenuItem>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem> Hi, {user?.fullName}</MenuItem>
            <Divider />
            {user.roles.includes("admin") ? (
              <Link onClick={handleClose} href="/panel">
                <MenuItem onClick={handleClose} sx={{ borderRadius: "2rem" }}>
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  Dashboard
                </MenuItem>
              </Link>
            ) : (
              ""
            )}

            <Link onClick={handleClose} href="/profile">
              <MenuItem onClick={handleClose} sx={{ borderRadius: "2rem" }}>
                <Avatar
                  sx={{ width: 24, height: 24, marginRight: ".8rem" }}
                  fontSize="small"
                />
                Profile
              </MenuItem>
            </Link>

            <MenuItem onClick={handleLogout} sx={{ borderRadius: "2rem" }}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </>
      ) : (
        <>
          <MenuItem
            sx={{ borderRadius: "2rem", marginRight: "2rem" }}
            onClick={handleClick}
          >
            <PersonOutlineOutlinedIcon />
          </MenuItem>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <Link href="/login">
              <MenuItem sx={{ borderRadius: "2rem" }}>
                <ListItemIcon>
                  <VpnKeyOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Login
              </MenuItem>
            </Link>
            <Link href="/signup">
              <MenuItem sx={{ borderRadius: "2rem" }}>
                <ListItemIcon>
                  <LockOpenOutlinedIcon fontSize="small" />
                </ListItemIcon>
                Sign Up
              </MenuItem>
            </Link>
          </Menu>
        </>
      )}
    </nav>
  );
}
