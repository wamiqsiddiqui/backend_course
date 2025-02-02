const Sequelize = require("sequelize");

const sequelize = new Sequelize("node-complete", "root", "Mysql@1234", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;
