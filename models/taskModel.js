module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define(
    "task",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      index: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return { Task };
};
