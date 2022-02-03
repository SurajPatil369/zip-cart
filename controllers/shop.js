const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const order = require("../models/order");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const ITEMS_PER_PAGE = 3;
const stripe = require("stripe")(process.env.STRIPE_KEY); //private key;

exports.getShopProducts = (req, res, next) => {
  // // res.send('Hello from express app')
  // console.log(adminData.products)
  // res.sendFile(path.join(rootPath,'views','shop.html'))
  //   let products = adminData.products;
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProduct = (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id).then((product) => {
    res
      .render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
      });
  });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    //provided the path to populate the
    .then((user) => {
      const product = user.cart.items;
      // product.forEach((element) => {
      //   console.log(element.productId.title);
      // });
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: product,
        //isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  let id = req.body.productId;
  Product.findById(id)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId") //provided the path to populate the
    .then((user) => {
      const productsFromCart = user.cart.items.map((p) => {
        return { product: { ...p.productId._doc }, quantity: p.quantity };
      });
      let order = new Order({
        products: productsFromCart,
        user: { email: req.user.email, userId: req.session.user },
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then((result) => res.redirect("/orders"))
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ "user.userId": req.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        pageTitle: "your order",
        path: "/orders",
        orders: orders,
        //isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      console.log("removed from cart");
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.productDescription = (req, res, next) => {
  const id = req.params.productId;

  console.log("called product description");
  Product.findById(id)
    .then((product) => {
      console.log(product);
      res.render("shop/product-detail", {
        pageTitle: "shop/product-detail",
        path: "/product-detail",
        //isAuthenticated: req.session.isLoggedIn,
        product: product,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getCheckout = (req, res, next) => {
  console.log("getchekout");
  let products;
  let total = 0;
  req.user
    .populate("cart.items.productId")
    // .execPopulate()
    .then((user) => {
      products = user.cart.items;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });
      return stripe.checkout.sessions.create({
        payment_method_types: ["card"], //we accept card paymenet
        //which products will be chekouted
        line_items: products.map((p) => {
          return {
            name: p.productId.title,
            description: p.productId.price,
            currency: "inr",
            quantity: p.quantity,
            amount:total
          };
        }),
        //if payment successes redirect to this url
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success", //http://localhost:3000/
        //if payment fails redirect to this url
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      console.log(products, total, session.id);
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

// serving the hardcoded pdf file

// exports.getInvoice = (req, res, next) => {
//   const orderId = req.params.orderId;

//   Order.findById(orderId)
//     .then((order) => {
//       if (!order) {
//         return next(new Error("No order found."));
//       }
//       if (order.user.userId.toString() !== req.user._id.toString()) {
//         console.log("cheked");
//         return next(new Error("Unauthorized"));
//       }

//       const invoiceName = "invoice-" + orderId + ".pdf";
//       const invoicePath = path.join("data", "invoices", invoiceName);

//       //this readfile function loads the all the file data into memory and then forward the response
//       //but it not good case for larger file if their are multiple request the memory can overlap
//       //so beacause of that we should use readFileStream to read and deliver the file on the fly.

//       // fs.readFile(invoicePath, (err, data) => {
//       //   if (err) {
//       //     console.log('yaha pe error hai')
//       //     return next(err);
//       //   }
//       //   res.setHeader('Content-Type', 'application/pdf');
//       //   res.setHeader(
//       //     'Content-Disposition',
//       //     'inline; filename="' + invoiceName + '"'
//       //   );
//       //   res.send(data);
//       // });

//       const file = fs.createReadStream(invoicePath);
//       var stat = fs.statSync(invoicePath);
//       res.setHeader('Content-Length', stat.size);
//       res.setHeader('Content-Type', 'application/pdf');
//       res.setHeader(
//         'Content-Disposition',
//         'inline; filename="' + invoiceName + '"'
//       );
//       file.pipe(res);
//     })
//     .catch((err) => next(err));
// };

//creating the pdf files on the fly and serving it

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId).then((order) => {
    if (!order) {
      return next(new Error("No order found."));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      console.log("cheked");
      return next(new Error("Unauthorized"));
    }
    const invoiceName = "invoice-" + orderId + ".pdf";
    const invoicePath = path.join("data", "invoices", invoiceName);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + invoiceName + '"'
    );
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(invoicePath));
    doc.pipe(res);
    let totalPrize = 0;
    doc.fontSize(26).text("Invoice", {
      underline: true,
    });
    doc.text("-----------------------------------------------");
    order.products.forEach((prod) => {
      totalPrize += prod.quantity * prod.product.price;
      doc
        .fontSize(15)
        .text(
          prod.product.title + "-" + prod.quantity + "X" + prod.product.price
        );
    });
    doc.text("----------------------------------------------");
    doc.moveDown(1).text("Total:" + totalPrize);

    doc.end();
  });
};
