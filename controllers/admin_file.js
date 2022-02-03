// const Product = require("../module/product_file");

// exports.getAddProducts = (req, res, next) => {
//   //rendering ejs template
//   res.render("admin/edit-product", {
//     pageTitle: "Add Product",
//     path: "/admin/add-product",
//     editing:false
//   });
//   // res.sendFile(path.join(rootPath, "views", "add-product.html"));
//   // res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
//   // res.send(`<form action='/admin/product' method="POST"> <input type='text' name='title'></input> <button type='submit'>submit</button></form>`)
// };

// exports.getEditProduct = (req, res, next) => {
//   const editMode = req.query.edit;

//   if (!editMode) {
//     res.redirect("/");
//     return;
//   }
//   const id=req.params.productId
//   Product.getProductById(id,(product)=>{
//     res.render("admin/edit-product", {
//       pageTitle: "Edit Product",
//       path: "/admin/edit-product",
//       editing: editMode,
//       product:product
//     });
//   })
 
// };

// exports.postEditProduct=(req,res,next)=>{
//   let id=req.body.productId
//   const title = req.body.title;
//   const imgUrl = req.body.imgUrl;
//   const price = req.body.price;
//   const description = req.body.description;
//   const product = new Product(id,title, imgUrl, price, description);
//   product.save();
//   res.redirect('/admin/products')
  
// }

// exports.postAddProducts = (req, res, next) => {
//   // products.push({ title: req.body.title });
//   const title = req.body.title;
//   const imgUrl = req.body.imgUrl;
//   const price = req.body.price;
//   const description = req.body.description;
//   const product = new Product(null,title, imgUrl, price, description);
//   product.save();
//   res.redirect("/");
// };

// // exports.getEditProduct = (req, res, next) => {
// //   res.render("admin/edit-product", {
// //     pageTitle: "Edit product",
// //     path: "/admin/add-product",
// //   });
// // };
// exports.getProducts = (req, res, next) => {
//   Product.fetchAll((products) => {
//     res.render("admin/products", {
//       prods: products,
//       pageTitle: "Admin Product",
//       path: "/admin/products",
//     });
//   });
// };

// exports.deleteProduct=(req,res,next)=>{
//   let id =req.params.productId;
//   Product.deleteProductFromFile(id);
//   res.redirect('/admin/products');
// }