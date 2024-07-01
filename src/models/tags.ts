import { DataTypes, Models, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const Tags = sequelize.define("tags", {
    name: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });

  Tags.associate = (models: Models) => {
    Tags.belongsToMany(models.posts, { through: "post-tags" });

    Tags.addScope("defaultScope", {
      attributes: ["id", "name"],
    });
  };

  return Tags;
};
