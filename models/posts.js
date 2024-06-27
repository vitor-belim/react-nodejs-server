module.exports = (sequelize, DataTypes) => {
  const Posts = sequelize.define("posts", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    postText: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    allowComments: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  });

  Posts.associate = (models) => {
    Posts.belongsTo(models.users, {
      onDelete: "CASCADE",
    });
    Posts.hasMany(models.likes, {
      onDelete: "CASCADE",
    });
    Posts.belongsToMany(models.tags, { through: "post-tags" });

    // Used only when filtering by tag
    Posts.belongsToMany(models.tags, {
      through: "post-tags",
      as: "tags-filter-table",
    });

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
