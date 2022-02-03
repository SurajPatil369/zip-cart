const express = require("express");
// const http =require('http');
// const adminData = require("./routes/admin"); requiring individual route from routes
const fs=require('fs')
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const helmet = require("helmet");
const compression = require('compression')
const morgan = require('morgan')

require('dotenv').config()

const mongoose = require("mongoose");
const User = require("./models/user");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf"); // for protection against csrf attack using it on every rendered page
const flash = require("connect-flash"); //for displaying flash error message
const errorController=require('./controllers/error')
const multer=require('multer');



const CONNECT_URI =process.env.MONGO_URI;

const store = new MongoDBStore({
  uri: CONNECT_URI,
  collection: "sessions",
});
const csrfProtection = csrf();



const fileStorage=multer.diskStorage({
  destination: (req,file,cb)=> {
    cb(null,'images')//first arg is for throwing error if their is error it will throw out
  },
  filename: (req,file,cb)=> {
    cb(null,Math.random().toString() + '-' + file.originalname)
  }
})

const fileFilter=(req,file,cb)=>{
  console.log('checked file type')
  if(file.mimetype ==='image/png' || file.mimetype==='image/jpg' || file.mimetype==='image/jpeg')
  {cb(null,true);
   
  }
  else{
    cb(null,false)
  }
 
}
const adminRoute = require("./routes/admin");
const shopRoute = require("./routes/shop");
const authRoute = require("./routes/auth");
 
// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
 
// setup the logger
app.use(morgan('combined', { stream: accessLogStream }))


app.set("view engine", "ejs"); 
app.set("views", "views");
app.use(helmet());
app.use(compression())


app.use(bodyParser.urlencoded({ extended: false })); //used to parse the form body or form data
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'))
app.use(express.static(path.join(__dirname, "public"))); // used to serve the static pages
//basically using express static middleware files are served as if they are in the root folder .off course images 
//should be in separate images folder . so to mimic that the our files are available on root folder we can add /images at front
//as shown below. any request which has /images in request will served from here
app.use('/images',express.static(path.join(__dirname, "images"))); // used to serve the static images


app.use(
  session({
    secret: "My secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//csrf middleware
app.use(csrfProtection);


app.use(flash());




app.use((req, res, next) => {
 
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

//middleware to set the logged in user to req object . to use it globally.
app.use((req, res, next) => {
  //in sync code we can writing the below statement can reac to error-middlware
   // throw new Error('Sync Dummy'); 
  if (!req.session.user) {
    console.log('user not found')
    return next();
  }
  User.findById(req.session.user._id).then((user) => {
    if (!user) {
      return next(); 
    }
    req.user = user;
    next();
  })
  .catch(err => {
    //this error will be thrown when their is issue with database fetching like in case of same file reading by multiple user at same time.
    console.log('error thrown')
    next(new Error(err));//in asynchronous we have to pass error to next object to send it to error middleware
  });
});


app.use("/admin", adminRoute);
app.use(shopRoute);
app.use(authRoute);
const PORT = 3001;



// app.use("/admin", adminData.routes);requring individual routes from router

app.get('/500', errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  res.redirect('/500');
  // res.status(500).render('500', {
  //   pageTitle: 'Error!',
  //   path: '/500',
  //   isAuthenticated:true,
  //   csrfToken: req.session.csrfToken 
  // });
});



// app.use((req, res, next) => {
//   // res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
//   res.status(404).render("404", { pageTitle: "page not found", path: "404" });
// });

//middleware to send the value to each an every render view
//we can do it individually on while rendering each view by setting the value inside object while
//rendering as (isAuthenticated) we used earliear
//we can pass any value to view using locals object availbale

mongoose
  .connect(CONNECT_URI)
  .then((result) => {
    //here we have created the dummy user

    // User.findOne().then((user) => {
    //   if (!user) {
    //     const user = new User({
    //       name: "suraj",
    //       email: "sp680199@gmail.com",
    //       cart: {
    //         items: [],
    //       },
    //     });
    //     user.save();
    //   }
    // });
    app.listen(PORT||process.env.PORT);
    console.log("connection succefull with mongoose");
  })
  .catch((err) => console.log(err));
