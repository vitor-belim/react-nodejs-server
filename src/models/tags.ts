module.exports = (sequelize, DataTypes) => {
  const Tags = sequelize.define("tags", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  Tags.associate = (models) => {
    Tags.belongsToMany(models.posts, { through: "post-tags" });

    Tags.addScope("defaultScope", {
      attributes: ["id", "name"],
    });
  };

  return Tags;
};
