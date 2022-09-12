import { useRouter } from "next/router";
import React, { useContext, useState } from "react";
// import dynamic from "next/dynamic";
// const Layout = dynamic(() => import("../../components/Layout"), { ssr: false });
import NextLink from "next/link";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Grid,
  Link,
  List,
  ListItem,
  TextField,
  Typography,
} from "@material-ui/core";
import Image from "next/image";
import db from "../../utils/db";
import Product from "../../models/Product";
import axios from "axios";
import { Store } from "../../utils/Store";
import Layout from "../../components/Layout";
import { Rating } from "@material-ui/lab";
import { useSnackbar } from "notistack";
import { useEffect } from "react";
import useStyles from "../../utils/styles";
export default function ProductScreen(props) {
  const router = useRouter();
  const { dispatch, state } = useContext(Store);
  const { product } = props;
  console.log(product);
  const { userInfo } = state;
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoading(false);
      setComment("");
      setRating(0);
      enqueueSnackbar("Review submitted successfully", { variant: "success" });
      fetchReviews();
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(err.response.data.message, { variant: "error" });
    }
  };
  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      setReviews(data);
    } catch (err) {
      enqueueSnackbar(err.response.data.message, { variant: "error" });
    }
  };
  useEffect(() => {
    fetchReviews();
  }, []);

  if (!product) return <div>Product not found</div>;
  const addToCartHandler = async () => {
    setLoading(true);
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      setLoading(false);
      window.alert("Sorry. Product is out of stock");

      return;
    }
    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    setLoading(false);
    router.push("/cart");
  };

  return (
    <div>
      {loading ? (
        <div
          style={{
            opacity: 0.3,
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      ) : (
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
                    <Rating value={product.rating} readOnly></Rating>
                    <Link href="#reviews">
                      <Typography>({product.numReviews} reviews)</Typography>
                    </Link>
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
                            {product.countInStock > 0
                              ? "In stock"
                              : "Out stock"}
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
          <List>
            <ListItem>
              <Typography name="reviews" id="reviews" variant="h2">
                Customer reviews
              </Typography>
            </ListItem>
            {reviews.length === 0 && <ListItem>No review</ListItem>}
            {reviews.map((review) => (
              <ListItem key={review._id}>
                <Grid container>
                  <Grid item className={classes.reviewItem}>
                    <Typography>
                      <strong>{review.name}</strong>
                    </Typography>
                    <Typography>{review.createdAt.substring(0, 10)}</Typography>
                  </Grid>
                  <Grid item>
                    <Rating value={review.rating} readOnly></Rating>
                    <Typography>{review.comment}</Typography>
                  </Grid>
                </Grid>
              </ListItem>
            ))}
            <ListItem>
              {" "}
              {userInfo ? (
                <form onSubmit={submitHandler} className={classes.reviewForm}>
                  <List>
                    <ListItem>
                      <Typography variant="h2">Leave your review</Typography>
                    </ListItem>
                    <ListItem>
                      <TextField
                        multiline
                        variant="outlined"
                        fullWidth
                        name="review"
                        label="Enter comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </ListItem>
                    <ListItem>
                      <Rating
                        name="simple-controlled"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                      />
                    </ListItem>
                    <ListItem>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                      >
                        Submit
                      </Button>

                      {loading && <CircularProgress></CircularProgress>}
                    </ListItem>
                  </List>
                </form>
              ) : (
                <Typography variant="h2">
                  Please{" "}
                  <Link href={`/login?redirect=/product/${product.slug}`}>
                    login
                  </Link>{" "}
                  to write a review
                </Typography>
              )}
            </ListItem>
          </List>
        </Layout>
      )}
    </div>
  );
}
export const getStaticPaths = async () => {
  await db.connect();
  const response = await Product.find({});

  await db.disconnect();
  return {
    paths: response.map((product) => ({
      params: { slug: product.slug.toString() },
    })),
    fallback: true,
  };
};
export const getStaticProps = async (context) => {
  const slug = context.params?.slug;

  if (!slug) return { notFound: true };
  await db.connect();

  const product = await Product.findOne({ slug });
  const convertedSingleProducts = JSON.parse(JSON.stringify(product));

  await db.disconnect();

  return {
    props: {
      product: convertedSingleProducts,
    },
    revalidate: 1,
  };
};
// export async function getServerSideProps(context) {
//   const { params } = context;
//   const { slug } = params;
//   await db.connect();
//   const product = await Product.findOne({ slug }).lean();
//   await db.disconnect();
//   return {
//     props: {
//       product: db.convertDocToObj(product),
//     },
//   };
// }
