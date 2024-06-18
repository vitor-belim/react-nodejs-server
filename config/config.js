require("dotenv").config();

module.exports = {
  development: {
    username: "root",
    password: process.env.LOCAL_DB_PASSWORD,
    database: "react-nodejs",
    host: "127.0.0.1",
    dialect: "mysql",
    logging: console.log,
  },
  test: {
    username: "root",
    password: null,
    database: "react-nodejs-test",
    host: "127.0.0.1",
    dialect: "mysql",
  },
  production: {
    username: "enhxfcp5q68rjpdt",
    password: "fdd8gn71rscnyvu2",
    database: "kh2mtb20vqyrspbj",
    host: "nr84dudlpkazpylz.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
    dialect: "mysql",
  },
};
