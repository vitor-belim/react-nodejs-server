module.exports = (sequelize: any, dataTypes: any) => {
  const Posts = sequelize.define("posts", {
    title: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    postText: {
      type: dataTypes.TEXT,
      allowNull: false,
    },
    allowComments: {
      type: dataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });

  Posts.associate = (models: any) => {
    Posts.belongsTo(models.users, {
      onDelete: "CASCADE",
    });
    Posts.hasMany(models.likes, {
      onDelete: "CASCADE",
    });
    Posts.belongsToMany(models.tags, { through: "post-tags" });

    Posts.addScope("defaultScope", {
      include: [
        {
          model: models.users,
        },
        {
          model: models.likes,
        },
        {
          model: models.tags,
          through: {
            attributes: [],
          },
        },
      ],
      attributes: {
        exclude: ["userId", "createdAt", "updatedAt"],
      },
      order: [["id", "DESC"]],
    });
  };

  return Posts;
};
