import React, { useContext } from "react";
import Head from "next/head";

import NextLink from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Link,
  ThemeProvider,
  CssBaseline,
  Switch,
  createMuiTheme,
  Badge,
  Button,
  Menu,
  MenuItem,
} from "@material-ui/core";

import Cookies from "js-cookie";

import Image from "next/image";
import useStyles from "../utils/styles";
import { Store } from "../utils/Store";
import { useState } from "react";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
export default function Layout({ title, description, children }) {
  const classes = useStyles();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const { state, dispatch } = useContext(Store);
  const [anchorEl, setanchorEl] = useState(null);
  const { darkMode, userInfo } = state;
  const cartLength = state.cart.cartItems.length;
  const handleChangeDarkMode = () => {
    dispatch({ type: darkMode ? "DARK_MODE_OFF" : "DARK_MODE_ON" });
    const newDarkMode = !darkMode;
    Cookies.set("darkMode", newDarkMode ? "ON" : "OFF");
  };
  const theme = createMuiTheme({
    typography: {
      h1: {
        fontSize: "1.6rem",
        fontWeight: 400,
        margin: "1rem 0",
      },
      h2: {
        fontSize: "1.4rem",
        fontWeight: 400,
        margin: "1rem 0",
      },
    },
    palette: {
      type: darkMode ? "dark" : "light",
      primary: {
        main: "#f0c000",
      },
      secondary: {
        main: "#208080",
      },
    },
  });
  const loginClickHandler = (e) => {
    setanchorEl(e.currentTarget);
  };
  const loginMenuCloseHandler = (e, redirect) => {
    setanchorEl(null);
    if (redirect) {
      router.push(redirect);
    }
  };
  const logoutClickHandler = () => {
    setanchorEl(null);
    dispatch({ type: "USER_LOGOUT" });
    Cookies.remove("userInfo");
    Cookies.remove("cartItems");
    enqueueSnackbar("Logout success", { variant: "success" });
    router.push("/");
  };
  return (
    <div>
      <Head>
        <title>{title ? `${title} - PH SHOP` : "PH SHOP"}</title>
        {description && <meta name="description" content={description}></meta>}
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static" className={classes.navbar}>
          <Toolbar>
            <NextLink href="/">
              <a>
                <Image
                  src="https://res.cloudinary.com/luuphuchung2810/image/upload/v1661692607/avatar/PHMovie__1___1_-removebg-preview_mwcwny.png"
                  width={100}
                  height={80}
                />
              </a>
            </NextLink>
            <div className={classes.grow}></div>
            <div>
              <Switch
                checked={darkMode}
                onChange={handleChangeDarkMode}
              ></Switch>
              <NextLink href="/cart" passHref>
                <Link>
                  <Typography component="span">
                    {cartLength > 0 ? (
                      <Badge color="secondary" badgeContent={cartLength}>
                        Cart
                      </Badge>
                    ) : (
                      "Cart"
                    )}
                  </Typography>
                </Link>
              </NextLink>
              {userInfo ? (
                <>
                  <Button
                    className={classes.navbarButton}
                    onClick={loginClickHandler}
                  >
                    {userInfo.name}
                  </Button>
                  <Menu
                    id="simple-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={loginMenuCloseHandler}
                    style={{ marginTop: "40px" }}
                  >
                    <MenuItem
                      onClick={(e) => loginMenuCloseHandler(e, "/profile")}
                    >
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={(e) =>
                        loginMenuCloseHandler(e, "/order-history")
                      }
                    >
                      Order Hisotry
                    </MenuItem>
                    {userInfo.isAdmin && (
                      <MenuItem
                        onClick={(e) =>
                          loginMenuCloseHandler(e, "/admin/dashboard")
                        }
                      >
                        Admin Dashboard
                      </MenuItem>
                    )}
                    <MenuItem onClick={logoutClickHandler}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <NextLink href="/login">
                  <Link>Login</Link>
                </NextLink>
              )}
            </div>
          </Toolbar>
        </AppBar>
        <Container className={classes.main}>{children}</Container>
        <footer className={classes.footer}>
          <Typography>All right reserved 2022 LPHSHOP</Typography>
        </footer>
      </ThemeProvider>
    </div>
  );
}
