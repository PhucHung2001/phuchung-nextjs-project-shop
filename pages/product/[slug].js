import { useRouter } from "next/router";
import React, { useContext } from "react";
// import dynamic from "next/dynamic";
// const Layout = dynamic(() => import("../../components/Layout"), { ssr: false });
import NextLink from "next/link";
import {
  Box,
  Button,
  Card,
  Grid,
  Link,
  List,
  ListItem,
  Typography,
} from "@material-ui/core";
import Image from "next/image";
import db from "../../utils/db";
import Product from "../../models/Product";
import axios from "axios";
import { Store } from "../../utils/Store";
import Layout from "../../components/Layout";
export default function ProductScreen(props) {
  const router = useRouter();
  const { dispatch, state } = useContext(Store);
  const { product } = props;
  if (!product) return <div>Product not found</div>;
  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert("Sorry. Product is out of stock");
      return;
    }
    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    router.push("/cart");
  };

  return (
    <div>
      <Layout ttile={product.name} description={product.description}>
        <div>
          <NextLink href="/">
            <Link>
              <Box
                style={{
                  display: "flex",
                  margin: "10px 0px",
                  cursor: "pointer",
                }}
              >
                <Box>Back to home</Box>
              </Box>
            </Link>
          </NextLink>
          <Grid container spacing={1}>
            <Grid item md={6} xs={12}>
              <Image
                src={product.image}
                alt={product.name}
                width={640}
                height={640}
                layout="responsive"
              />
            </Grid>
            <Grid item md={3} xs={12}>
              <List>
                <ListItem>
                  <Typography component="h1" variant="h5">
                    {product.name}
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography>Category: {product.category}</Typography>
                </ListItem>
                <ListItem>
                  <Typography>Brand: {product.brand}</Typography>
                </ListItem>

                <ListItem>
                  <Typography>
                    Rating: ${product.rating} (10) reviews
                  </Typography>
                </ListItem>
                <ListItem>
                  <Typography>Description: {product.description}</Typography>
                </ListItem>
              </List>
            </Grid>
            <Grid item md={3} xs={12}>
              <Card>
                <List>
                  <ListItem>
                    <Grid container>
                      <Grid item xs={6}>
                        <Typography>Price </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography> {product.price}</Typography>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <ListItem>
                    <Grid container>
                      <Grid item xs={6}>
                        <Typography>Status </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography>
                          {" "}
                          {product.countInStock > 0 ? "In stock" : "Out stock"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <ListItem>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={addToCartHandler}
                    >
                      Add to cart
                    </Button>
                  </ListItem>
                </List>
              </Card>
            </Grid>
          </Grid>
        </div>
      </Layout>
    </div>
  );
}
export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;
  await db.connect();
  const product = await Product.findOne({ slug }).lean();
  await db.disconnect();
  return {
    props: {
      product: JSON.parse(JSON.stringify(product)),
    },
  };
}
