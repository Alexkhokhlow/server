module.exports = (sequelize, DataTypes) => {
  const Taskinfo = sequelize.define(
    "taskinfo",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tasklist: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return { Taskinfo };
};
