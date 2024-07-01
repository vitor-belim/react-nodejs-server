import { DataTypes, Models, Sequelize } from "sequelize";

module.exports = (sequelize: Sequelize, dataTypes: DataTypes) => {
  const Comments = sequelize.define("comments", {
    commentBody: {
      type: dataTypes.TEXT,
      allowNull: false,
    },
  });

  Comments.associate = (models: Models) => {
    Comments.belongsTo(models.users, {
      onDelete: "CASCADE",
    });
    Comments.belongsTo(models.posts, {
      onDelete: "CASCADE",
    });

    Comments.addScope("defaultScope", {
      include: [
        {
          model: models.users,
        },
        {
          model: models.posts,
          include: [
            {
              model: models.users,
            },
          ],
        },
      ],
      attributes: {
        exclude: ["userId", "postId", "createdAt", "updatedAt"],
      },
      order: [["id", "DESC"]],
    });
  };

  return Comments;
};
