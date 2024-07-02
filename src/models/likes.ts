module.exports = (sequelize: any, _dataTypes: any) => {
  const Likes = sequelize.define("likes", {});

  Likes.associate = (models: any) => {
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
