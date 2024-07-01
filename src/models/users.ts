import { DataTypes, Model, Models, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const Users: Model<any, any> = sequelize.define("users", {
    username: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });

  Users.associate = (_models: Models) => {
    Users.addScope("defaultScope", {
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });
  };

  return Users;
};
