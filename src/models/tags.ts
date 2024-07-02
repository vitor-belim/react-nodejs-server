module.exports = (sequelize: any, dataTypes: any) => {
  const Tags = sequelize.define("tags", {
    name: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });

  Tags.associate = (models: any) => {
    Tags.belongsToMany(models.posts, { through: "post-tags" });

    Tags.addScope("defaultScope", {
      attributes: ["id", "name"],
    });
  };

  return Tags;
};
