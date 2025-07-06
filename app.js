require("dotenv").config();
const path = require("path");
const fs = require("fs");
const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const errorController = require("./controllers/error");
const User = require("./models/user");
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const shopController = require("./controllers/shop");
const isAuth = require("./middleware/is-auth");

const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});
const csrfProtection = csrf();

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

const fileStorage = multer.diskStorage({
  //This is just a storage engine used by multer to store files and configure their names
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  filename: (req, file, callback) => {
    callback(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  {
    flags: "a", //New data will be appended to the end of the file and not overwrite the existing file
  }
);
app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));
//Requests interact separated from each other. We need sessions to connect them
app.use(bodyParser.urlencoded({ extended: false })); //Is used to parse only text data and not files data so we use 'multer' for that
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
//statically serving a folder means that the folder is not
// processed by the server, but directly returned to the client and the request to files in that folder will be handled automatically
// and the files will be returned.
app.use(
  session({
    secret: "my secret",
    resave: false /**Means session willnot be saved on every request that is done, so on every response that is sent, but only if something change in the session */,
    saveUninitialized: false,
    store: store,
  })
);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
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

app.post("/create-order", isAuth, shopController.postOrder); //This route will not have csrf protection because stripe form doesn't need one
app.use(csrfProtection);
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
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
  console.log("500 Error = ", error);
  res.status(500).render("500", {
    pageTitle: "Server Error",
    path: "/500",
    error: error,
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then((result) => {
    app.listen(process.env.PORT || 3000);
    // https
    //   .createServer({ key: privateKey, cert: certificate }, app)
    //   .listen(process.env.PORT || 3000);
  })
  .catch((err) => console.log(err));
