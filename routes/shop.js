const express = require("express");
const router = express.Router();
const path = require("path");
const rootPath = require("../utils/path");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-Auth");
// const adminData=require('./admin') requring the products from admin

router.get(
  "/",
  shopController.getIndex

  // (req,res,next)=>{
  //   // // res.send('Hello from express app')
  //   // console.log(adminData.products)
  //   // res.sendFile(path.join(rootPath,'views','shop.html'))
  //   let products=adminData.products
  //   console.log(products)
  //   res.render('shop',{
  //     prods: products,
  //     pageTitle: 'Shop',
  //     path: '/',
  //     hasProducts: products.length > 0,
  //     activeShop: true,
  //     productCSS: true
  //     });
  //   })
);
router.get("/products", shopController.getShopProducts);
router.get("/products/:productId", isAuth, shopController.getProduct);
router.get("/cart", isAuth, shopController.getCart);
router.post("/cart", isAuth, shopController.postCart);
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);
router.get("/products/:productId", isAuth, shopController.productDescription);
router.post("/create-order", isAuth, shopController.postOrder);
router.get('/checkout', isAuth, shopController.getCheckout);
router.get('/checkout/success', isAuth, shopController.postOrder);//if payment succeds
router.get('/checkout/cancel', isAuth, shopController.getCheckout);//if payment fails

router.get("/orders", isAuth, shopController.getOrders);
router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
