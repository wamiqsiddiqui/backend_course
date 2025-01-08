const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const path = require("path");
// node specific modules

//3rd party packages
const express = require("express"); //express packages export an express function
const bodyParser = require("body-parser");
const app = express();

const rootDir = require("./util/path");
app.use(bodyParser.urlencoded({ extended: false })); //It registers a middleware, it will do body pasing automatically we had to do manually. It will parse bodies related to form data etc.
app.use(express.static(path.join(rootDir, "public"))); //It will serve static files like css, images etc
app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use("/", (req, res, next) => {
  res.status(404).sendFile(path.join(rootDir, "views", "notFound.html"));
});

//app is a valid request handler so we can pass it in create server
app.listen(3000);
