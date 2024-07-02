module.exports = (sequelize: any, dataTypes: any) => {
  const Users = sequelize.define("users", {
    username: {
      type: dataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: dataTypes.STRING,
      allowNull: false,
    },
  });

  Users.associate = (_models: any) => {
    Users.addScope("defaultScope", {
      attributes: {
        exclude: ["password", "createdAt", "updatedAt"],
      },
    });
  };

  return Users;
};
