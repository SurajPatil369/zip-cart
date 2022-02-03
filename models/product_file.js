
// const path = require("path");
// const fs = require("fs");
// const Cart = require("./cart");

// const p = path.join(
//   path.dirname(require.main.filename),
//   "data",
//   "product.json"
// );

// const getProductFromFile = (cb) => {
//   fs.readFile(p, (err, fileContent) => {
//     if (err) {
//       cb([]);
//     } else {
//       cb(JSON.parse(fileContent));
//     }
//   });
// };

// module.exports = class Product {
//   constructor(id, title, imgUrl, price, description) {
//     this.title = title;
//     this.imgUrl = imgUrl;
//     this.price = price;
//     this.description = description;
//     this.id = id;
//   }
//   //saving all the products
//   save() {
//     getProductFromFile((products) => {
//       if (this.id) {
//         let indexOfProductTobeUpdated = products.findIndex(
//           (prod) => prod.id === this.id
//         );
//         let updateProduct = [...products];
//         console.log(this);
//         updateProduct[indexOfProductTobeUpdated] = this;
//         fs.writeFile(p, JSON.stringify(updateProduct), (err) => {
//           console.log(err);
//         });
//       } else {
//         this.id = Math.random().toString();
//         products.push(this);
//         fs.writeFile(p, JSON.stringify(products), (err) => {
//           console.log(err);
//         });
//       }
//     });
//   }

//   //fetching the all the product

//   static fetchAll(cb) {
//     getProductFromFile(cb);
//   }

//   static deleteProductFromFile=(id)=>{
//     console.log('yes,actually delelted the product')
//     getProductFromFile((products)=>{
//       let updatedProduct;
//       const product=products.filter(prod=>prod.id===id)
//      updatedProduct = products.filter(prod=>prod.id!==id);

//       fs.writeFile(p, JSON.stringify(updatedProduct), (err) => {
//         if(!err){
//           Cart.deleteProduct(id,product.price);
//         }
//       });
//     })
//   }

//   static getProductById(id, cb) {
//     getProductFromFile((products) => {
//       const product = products.find((p) => p.id === id);
//       cb(product);
//     });
//   }
// };
