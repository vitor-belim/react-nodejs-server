import { DataTypes, Models, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize, _dataTypes: DataTypes) => {
  const Likes = sequelize.define("likes", {});

  Likes.associate = (models: Models) => {
    Likes.belongsTo(models.users, {
      onDelete: "CASCADE",
    });
    Likes.belongsTo(models.posts, {
      onDelete: "CASCADE",
    });

    Likes.addScope("defaultScope", {
      include: [
        {
          model: models.users,
        },
      ],
      attributes: {
        exclude: ["userId", "postId", "createdAt", "updatedAt"],
      },
    });
  };

  return Likes;
};
