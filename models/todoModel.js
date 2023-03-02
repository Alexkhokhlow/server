module.exports = (sequelize, DataTypes) => {
  const Todo = sequelize.define(
    "todo",
    {
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      checked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return { Todo };
};
