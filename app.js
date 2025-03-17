require("dotenv").config();
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const errorController = require("./controllers/error");
const User = require("./models/user");
const csrf = require("csurf");
const flash = require("connect-flash");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
//Requests interact separated from each other. We need sessions to connect them
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false /**Means session willnot be saved on every request that is done, so on every response that is sent, but only if something change in the session */,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
// app.get("/500", errorController.get500);
app.use(errorController.get404);

app.use((error, req, res, next) => {
  //When you call next(error); for async code, express will skip all other middlewares and go directly to the error handling middleware
  //When you throw error from any sync code, express will skip all other middlewares and go directly to the error handling middleware
  // res.redirect("/500");
  res.status(500).render("500", {
    pageTitle: "Server Error",
    path: "/500",
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
