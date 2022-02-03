const Product = require("../models/product");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const fileHelper=require('../utils/file')
exports.getAddProducts = (req, res, next) => {
  //rendering ejs template

  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errorMessage: null,
    hasError: false,
    validationError: [],
    //isAuthenticated: req.session.isLoggedIn
  });
  // res.sendFile(path.join(rootPath, "views", "add-product.html"));
  // res.sendFile(path.join(__dirname, "../", "views", "add-product.html"));
  // res.send(`<form action='/admin/product' method="POST"> <input type='text' name='title'></input> <button type='submit'>submit</button></form>`)
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;

  if (!editMode) {
    return res.redirect("/");
  }
  const id = req.params.productId;

  Product.findById(id)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationError: [],
        //isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  let id = req.body.productId;
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: true,
      product: {
        productId: id,
        title: title,
        price: price,
        description: description,
      },
      hasError: false,
      errorMessage: error.array()[0].msg,
      validationError: error.array(),
      //isAuthenticated: req.session.isLoggedIn
    });
  }
  Product.findById(id)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      product.title = title;
      if(image){
        fileHelper.deleteFile(product.imgUrl)
        product.imgUrl= image.path
        };
      product.price = price;
      product.description = description;
      return product.save().then((result) => {
       
        res.redirect("/admin/products");
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    })
};

exports.postAddProducts = (req, res, next) => {
  // products.push({ title: req.body.title });
 
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if(!image){
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: 'attached file is not an image',
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationError:[],
      //isAuthenticated: req.session.isLoggedIn
    });
  }

  //in this object creation we have the extrated parameters
  //on right side and the left side are the database
  // schema defined paramters
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/edit-product",
      editing: false,
      errorMessage: error.array()[0].msg,
      hasError: true,
      product: {
        title: title,
        price: price,
        description: description,
      },
      validationError: error.array(),
      //isAuthenticated: req.session.isLoggedIn
    });
  }
  const imgUrl=image.path;
  const product = new Product({
    title: title,
    price: price,
    description: description,
    imgUrl: imgUrl,
    userId: req.user, //req.user will automatically fetch the user id
  });
  //technically the save method dose'nt return any
  //promise but mongoose still support the use of
  //.then after saving.
  product
    .save()
    .then((result) => {
      console.log("created Product");
      res.redirect("/admin/products");
    }) //this save method is provided by mongoose
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// exports.getEditProduct = (req, res, next) => {
//   res.render("admin/edit-product", {
//     pageTitle: "Edit product",
//     path: "/admin/add-product",
//     editing:false
//   });
// };

exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    //select('title price -_id') // we can retrive only feilds that we required using select
    // .populate('userId','name')//we can populate the data within from one model to another model which is ofcourse related
    .then((products) => {
      console.log("products fethed from databse:");

      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Product",
        path: "/admin/products",
        //isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const id = req.body.productId;
  Product.findById(id).then(product=>{
    if(!product){
      return next(new Error('Product not found'));
    }
    fileHelper.deleteFile(product.imgUrl)
    return Product.deleteOne({ _id: id, userId: req.user._id })
  }).then((result) => {
      console.log("Product Deleted");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
