import "./globals.scss";
import "react-image-gallery/styles/scss/image-gallery.scss";
import { createContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import MainMenu from "../components/MainMenu";
import Authenticator from "../components/Authenticator";
import PanelSideBar from "../components/PanelSideBar";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Footer from "../components/Footer";
import Head from "next/head";
import Shipment from "../components/shipment";
import Script from "next/script";

export const UserContext = createContext();
export const AlertContext = createContext();
export const CartContext = createContext();

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [cart, setCart] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState(null);

  // read cart from local storage for the first time
  useEffect(() => {
    if (localStorage.getItem("cart")) {
      setCart(JSON.parse(window.localStorage.getItem("cart")));
    }
  }, []);

  // write cart to local storage on change
  useEffect(() => {
    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    import("preline");
  }, []);

  const renderMainMenu = () => {
    if (
      !router.pathname.includes("/panel") &&
      router.pathname !== "/login" &&
      router.pathname !== "/signup"
    )
      return <MainMenu />;
  };
  const renderPanelSideBar = () => {
    if (router.pathname.includes("/panel") && user.roles?.includes("admin"))
      return <PanelSideBar />;
  };

  const renderFooter = () => {
    if (!router.pathname.includes("/panel")) {
      return <Footer />;
    }
  };

  const handleCloseAlert = () => {
    setError("");
    setMessage("");
  };

  return (
    <>
        <AlertContext.Provider value={{ setMessage, setError }}>
          <CartContext.Provider value={{ cart, setCart }}>
            <UserContext.Provider value={{ user, setUser }}>
              <Head>
                <title>Coolgards</title>
                <meta name="description" content="Welcome to Coolgards" />
                <link rel="icon" href="/favicon.ico" />
              </Head>
              <Shipment />
              <Authenticator />
              <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
              >
                <Alert
                  onClose={handleCloseAlert}
                  variant="filled"
                  severity={"error"}
                >
                  {error}
                </Alert>
              </Snackbar>
              <Snackbar
                open={!!message}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
              >
                <Alert
                  onClose={handleCloseAlert}
                  variant="filled"
                  severity={"success"}
                >
                  {message}
                </Alert>
              </Snackbar>

              {renderMainMenu()}
              {renderPanelSideBar()}
              {router.pathname.includes("/panel") &&
              !user.roles?.includes("admin") ? (
                "Please Login As Admin"
              ) : (
                <Component {...pageProps} />
              )}
              {renderFooter()}

              <Script async src={`https://www.googletagmanager.com/gtag/js?id="${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}"`} />
              <Script id="google-analytics">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
 
          gtag('config', "${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}");
        `}
              </Script>
            </UserContext.Provider>
          </CartContext.Provider>
        </AlertContext.Provider>
    </>
  );
}

export default MyApp;
