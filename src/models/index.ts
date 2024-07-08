"use strict";

import fs from "fs";
import path from "path";
import { DataTypes, Sequelize } from "sequelize";
import { config } from "../config/config";

require("dotenv").config();

const db: any = {
  sequelize: Sequelize,
  Sequelize: Sequelize,
};

let sequelize: Sequelize = new Sequelize(
  config.database || "db",
  config.username || "root",
  config.password || "root",
  config,
);

const basename = path.basename(__filename);

fs.readdirSync(__dirname)
  .filter((file: string) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      [".js", ".ts"].includes(file.slice(-3)) &&
      file.indexOf(".test.ts") === -1 &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file: string) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName: string) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
