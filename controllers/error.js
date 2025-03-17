const isAuth = require("../middleware/is-auth");

exports.get404 = (req, res, next) => {
  res.status(404).render("404", {
    pageTitle: "Page Not Found",
    path: "/404",
    isAuthenticated:
      req.session.isLoggedIn /**We can use this because we have a session */,
  });
};

exports.get500 = (req, res, next) => {
  res.status(500).render("500", {
    pageTitle: "Server Error",
    path: "/500",
  });
};
