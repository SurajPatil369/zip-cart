const express = require("express");

const router = express.Router();
const path = require("path");
const rootPath = require("../utils/path"); //for path in util
const { check, body } = require("express-validator");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-Auth");
// const products=[];

//  /admin/add-product

//routes get executed from left to right is user is not authenticated then his request will be not accepted

router.get(
  "/add-product",
  isAuth,
  adminController.getAddProducts
  // (req, res, next) => {

  //rendering ejs template
  // res.render('add-product',{
  //   pageTitle: 'Add Product',
  //   path: '/admin/add-product',
  //   formsCSS: true,
  //   productCSS: true,
  //   activeAddProduct: true
  // })
  // res.sendFile(path.join(rootPath, "views", "add-product.html"));
  // res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
  // res.send(`<form action='/admin/product' method="POST"> <input type='text' name='title'></input> <button type='submit'>submit</button></form>`)
  // }
);
// /admin/add-product
router.post(
  "/add-product",
  [
    body("title", "Title field cannot be empty").trim().not().isEmpty().trim(),
    body("price", "Plese provide the price")
      .trim()
      .not()
      .isEmpty()
      .isNumeric()
      .withMessage("plese enter valid price")
      .trim(),
    body("description", "plese provide the description")
      .trim()
      .isLength({ min: 5, max: 200 })
      .not()
      .isEmpty(),
  ],
  isAuth,
  adminController.postAddProducts
  //  (req, res, next) => {
  //   products.push({title:req.body.title});
  //   res.redirect("/");
  // }
);
router.get("/products", isAuth, adminController.getProducts);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post(
  "/edit-product",
  [
    body("title", "Title field cannot be empty").trim().not().isEmpty().trim(),
    
    body("price", "Plese provide the price")
      .trim()
      .not()
      .isEmpty()
      .isNumeric()
      .withMessage("plese enter valid price")
      .trim(),
    body("description", "plese provide the description")
      .trim()
      .isLength({ min: 5, max: 200 })
      .not()
      .isEmpty(),
  ],
  isAuth,
  adminController.postEditProduct
);
router.post("/delete-product", isAuth, adminController.deleteProduct);
// // /admin/products

// ** if you want to pass individual router **//

// exports.routes=router;
// exports.products=products

module.exports = router;
