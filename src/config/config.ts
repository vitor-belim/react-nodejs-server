require("dotenv").config();

// IMPORTANT: this file must remain as .js as to not break the Heroku production build

module.exports = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: console.log,
};
