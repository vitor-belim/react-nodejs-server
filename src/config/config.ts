import { Options } from "sequelize";

require("dotenv").config();

export const config: Options = {
  username: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_DATABASE || "db",
  host: process.env.DB_HOST || "127.0.0.1",
  dialect: "mysql",
  logging: console.log,
};
