module.exports = (sequelize, DataTypes) => {
  const TaskLabel = sequelize.define(
    "task_label",
    {
      name: {
        type: DataTypes.STRING,
      },
    },
    { timestamps: true }
  );

  return { TaskLabel };
};
