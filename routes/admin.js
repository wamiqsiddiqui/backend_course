const { body } = require("express-validator");
const express = require("express");

const isAuth = require("../middleware/is-auth");

const adminController = require("../controllers/admin");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post(
  "/add-product",
  isAuth,
  [
    body("title")
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error("Please enter title for the product");
        }
        return true;
      })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title should be atleast 3 characters long"),
    body("imageUrl")
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error("Please enter imageUrl for the product");
        }
        return true;
      })
      .trim()
      .isURL()
      .withMessage("Please enter a valid URL"),
    body("price")
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error("Please enter price for the product");
        }
        return true;
      })
      .trim()
      .custom((value) => {
        if (isNaN(value)) {
          throw new Error("Please enter a valid price");
        }
        if (Number(value) === 0) {
          throw new Error("Price cannot be zero");
        }
        if (value < 0) {
          throw new Error("Please enter a positive price number");
        }
        return true;
      }),
    body("description")
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error("Please enter description for the product");
        }
        return true;
      })
      .trim()
      .isLength({ min: 10 })
      .withMessage("description should be atleast 10 characters long"),
  ],
  adminController.postAddProduct
);

router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  isAuth,
  [
    body("title")
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error("Please enter title for the product");
        }
        return true;
      })
      .trim()
      .isLength({ min: 3 })
      .withMessage("Title should be atleast 3 characters long"),
    body("imageUrl")
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error("Please enter imageUrl for the product");
        }
        return true;
      })
      .trim()
      .isURL()
      .withMessage("Please enter a valid URL"),
    body("price")
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error("Please enter price for the product");
        }
        return true;
      })
      .trim()
      .custom((value) => {
        if (isNaN(value)) {
          throw new Error("Please enter a valid price");
        }
        if (Number(value) === 0) {
          throw new Error("Price cannot be zero");
        }
        if (value < 0) {
          throw new Error("Please enter a positive price number");
        }
        return true;
      }),
    body("description")
      .custom((value) => {
        if (value.trim().length === 0) {
          throw new Error("Please enter description for the product");
        }
        return true;
      })
      .trim()
      .isLength({ min: 10 })
      .withMessage("description should be atleast 10 characters long"),
  ],
  adminController.postEditProduct
);

router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;
