// const path = require("path");
// const fs = require("fs");

// const p = path.join(path.dirname(require.main.filename), "data", "cart.json");
// const getProductFromCartFile = (cb) => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb([]);
//     } else {
//       cb(JSON.parse(fileContent));
//     }
//   });
// };

// module.exports = class Cart {
//   static addProduct(productId, productPrice) {
//     let cart = { products: [], totalPrice: 0 };
//     fs.readFile(p, (err, fileContent) => {
//       if (!err) {
//         cart = JSON.parse(fileContent);
//       }
//       let existingProductIndex = cart.products.findIndex(
//         (p) => p.id === productId
//       );
//       let existingProduct = cart.products[existingProductIndex];

//       let updatedProduct;
//       if (existingProduct) {
//         updatedProduct = { ...existingProduct };
//         updatedProduct.qty = updatedProduct.qty + 1;
//         cart.products = [...cart.products];
//         cart.products[existingProductIndex] = updatedProduct;
//       } else {
//         let updatedProduct = { id: productId, qty: 1 };
//         cart.products = [...cart.products, updatedProduct];
//       }
//       cart.totalPrice = cart.totalPrice + +productPrice;
//       fs.writeFile(p, JSON.stringify(cart), (err) => {
//         console.log(err);
//       });
//     });
//   }
 
//   static deleteProduct(id, productPrice) {
//     fs.readFile(p, (err, fileContent) => {
//       if (err) {
//         return;
//       }
//       const updatedCart = { ...JSON.parse(fileContent) };
//       const product = updatedCart.products.find(prod => prod.id === id);
//       if (!product) {
//           return;
//       }
//       const productQty = product.qty;
//       updatedCart.products = updatedCart.products.filter(
//         prod => prod.id !== id
//       );
//       updatedCart.totalPrice =updatedCart.totalPrice - productPrice * productQty;

//       fs.writeFile(p, JSON.stringify(updatedCart), err => {
//         console.log(err);
//       });
//     });
//   }

//   static getProductFromCart(cb) {
//     getProductFromCartFile(cb);
//   }
// };
