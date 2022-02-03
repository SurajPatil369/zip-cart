// const Product = require("../module/product_file");
// const Cart = require("../module/cart");

// exports.getShopProducts = (req, res, next) => {
//   // // res.send('Hello from express app')
//   // console.log(adminData.products)
//   // res.sendFile(path.join(rootPath,'views','shop.html'))
//   //   let products = adminData.products;
//   Product.fetchAll((products) => {
//     // console.log('called html page')
//     res.render("shop/products-list", {
//       prods: products,
//       pageTitle: "All Products",
//       path: "/products",
//     });
//   });
// };

// exports.getProduct = (req, res, next) => {
//   const id = req.params.productId;
//   Product.getProductById(id, (product) => {
//     res.render("shop/product-description", {
//       product: product,
//       pageTitle: product.title,
//       path: "/products",
//     });
//   });
// };

// exports.getIndex = (req, res, next) => {
//   Product.fetchAll((products) => {
//     // console.log('called html page')
//     res.render("shop/index", {
//       prods: products,
//       pageTitle: "Index Page",
//       path: "/",
//     });
//   });
// };

// exports.getCart = (req, res, next) => {
//   Cart.getProductFromCart((cartProducts) => {
//     Product.fetchAll((products) => {
//       let cartProductToBeDisplayed = [];
//       for (let product of products) {
//         let cartProductsData = cartProducts.products.find(prod => prod.id === product.id);
//         if (cartProductsData) {
//           cartProductToBeDisplayed.push({productData:product,qty:cartProductsData.qty});
//         }
//       }
//       res.render("shop/cart", {
//         products: cartProductToBeDisplayed,
//         pageTitle: "cart page",
//         path: "/cart",
//       });
//     });
//   });
// };


// exports.postCart = (req, res, next) => {
//   let id = req.body.productId;
//   Product.getProductById(id, (product) => {
//     Cart.addProduct(id, product.price);
//   });
//   res.redirect('/cart')
  
// };

// exports.getOrders = (req, res, next) => {
//   res.render("shop/orders", {
//     pageTitle: "your order",
//     path: "/orders",
//   });
// };
// exports.postCartDeleteProduct = (req, res, next) => {
//   const prodId = req.body.productId;
//   Product.findById(prodId, product => {
//     Cart.deleteProduct(prodId, product.price);
//     res.redirect('/cart');
//   });
// };


// exports.getCheckout = (req, res, next) => {
//   res.render("shop/checkout", {
//     pageTitle: "checkout",
//     path: "/checkout",
//   });
// };


// exports.productDescription = (req, res, next) => {
//   res.render("shop/product-description", {
//     pageTitle: "shop/product-description",
//     path: "/product-description",
//   });
// };
