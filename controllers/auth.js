const { redirect } = require("express/lib/response");
const User = require("../models/user");
const bcrypt = require("bcryptjs"); // for incrypting the password
const nodemailer = require("nodemailer"); //for sending email
const sgTransport = require("nodemailer-sendgrid-transport"); //to connect with sendgrid
// const  cryptoRandomString= require( 'crypto-random-string');//to generate random secured bytes
const crypto = require("crypto");
const { validationResult } = require("express-validator"); //to get validation errors
const { error } = require("console");

const options = {
  auth: {
    api_key:
      "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",
  },
};

const mailer = nodemailer.createTransport(sgTransport(options));
exports.getLogin = (req, res, next) => {
  //  const  isLoggedIn=req.get('Cookie').split('=')[1].trim()==='true';
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isAuthenticated: false,
    errorMessage: message,
    email: undefined,
    password: undefined,
    validationError: [],
  });
};

//#session.save()

//Now the problem we can face here is writing that data to a database like mongodb
// can take a couple of milliseconds or depending on your speed even a bit more
// milliseconds.
// The redirect is fired independent from that though, so you might redirect too early.
// Now to be sure that your session has been set,
// you can use request session here and call the save method,
// you normally don't need to do that but you need to do it in scenarios where you need to be sure that
// your session was created before you continue because here, you can pass in a function that will be called
// once you're done saving the session.

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      pageTitle: "login",
      path: "/login",
      errorMessage: errors.array()[0].msg,
      //the below is for  persisting the data after entering the invalid credential.
      email: email,
      password: password,
      validationError: errors.array(),
      //isAuthenticated: req.session.isLoggedIn,
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/login", {
          pageTitle: "login",
          path: "/login",
          errorMessage: "invalid email or password",
          //the below is for  persisting the data after entering the invalid credential.
          email: email,
          password: password,
          validationError: [],
          //isAuthenticated: req.session.isLoggedIn,
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((isSame) => {
          if (isSame) {
            req.session.user = user;
            req.session.isLoggedIn = true;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            pageTitle: "login",
            path: "/login",
            errorMessage: "invalid email or password",
            //the below is for  persisting the data after entering the invalid credential.
            email: email,
            password: password,
            validationError: [],
            //isAuthenticated: req.session.isLoggedIn,
          });
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      err.httpStatuCode = 500;
      return next(error); //to send it to the middleware
    });
};
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "signup",
    path: "/signup",
    errorMessage: message,
    email: undefined,
    password: undefined,
    confirmPassword: undefined,
    validationError: [],
    //isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "signup",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      email: email,
      password: password,
      confirmPassword: confirmPassword,
      validationError: errors.array(),
      //isAuthenticated: req.session.isLoggedIn,
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      //the sequence of redirecting to login and sending email should be as follow otherwise sending email will block the redirect

      res.redirect("/login");
      //   return mailer.sendMail({
      //     to: email,
      //     from: "EMAIL_SENDER_ADDRESS",
      //     subject: "Signup succeeded",
      //     html: "<b>You successfully signed up! </b>",
      //   });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatuCode = 500;
      return next(error);
    });
};

exports.getReset = (req, res, next) => {
  //  const  isLoggedIn=req.get('Cookie').split('=')[1].trim()==='true';
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Reset Password",
    path: "/reset",
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      res.redirect("/reset");
    }
    let token = buffer.toString("hex");
    console.log(token);
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash(
            "error",
            "no account is found which is linked with this email"
          );
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/login");
        return mailer.sendMail({
          to: email,
          from: process.env.EMAIL_SENDER_ADDRESS,
          subject: "Reset Password",
          html: `<p>you have requested for reset password click on the link to <a href='http://localhost:3001/reset/${token}'>reset the password </a></p>`,
        });
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatuCode = 500;
        return next(error);
      });
  });
};

exports.getPasswordUpdate = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  let token = req.params.token;

  User.find({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      console.log(user);
      req.flash("err", "something went wrong");
      if (!user) {
        return redirect("/reset");
      }
      res.render("auth/new-password", {
        pageTitle: "new password",
        path: "/new-password",
        errorMessage: message,
        // userId: user._id.toString(),
        resetToken: token,
      });
      //isAuthenticated: req.session.isLoggedIn,
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatuCode = 500;
      return next(error);
    });
};

exports.postPasswordUpdate = (req, res, next) => {
  // let userId = req.body.userId;
  let newPassword = req.body.password;
  let resetToken = req.body.resetToken;
  User.findOne({
    resetToken: resetToken,
    resetTokenExpiration: { $gt: Date.now() },
  })
    .then((user) => {
      bcrypt
        .hash(newPassword, 12)
        .then((hashedPassword) => {
          user.password = hashedPassword;
          user.resetToken = undefined;
          user.resetTokenExpiration = undefined;
          return user.save();
        })
        .then((result) => {
          return res.redirect("/login");
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
