const getDb = require("../util/database").getDb;
const mongoDb = require("mongodb");
class Product {
  constructor(title, imageUrl, price, description, id, userId) {
    console.log("userId = ", userId);
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this._id = id ? new mongoDb.ObjectId(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db
        .collection("products") // ✅ Correct way to access the collection
        .insertOne(this);
    }
    return dbOp
      .then((result) => console.log(" inside = ", result))
      .catch((err) => console.log(err));
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((err) => console.log(err));
  }

  static findById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .find({ _id: new mongoDb.ObjectId(prodId) })
      .next()
      .then((product) => {
        console.log(product);
        return product;
      })
      .catch((err) => console.log(err));
  }

  static deleteById(prodId) {
    const db = getDb();
    return db
      .collection("products")
      .deleteOne({ _id: new mongoDb.ObjectId(prodId) })
      .then((result) => console.log("Deleted!"))
      .catch((err) => console.log(err));
  }
}

module.exports = Product;
