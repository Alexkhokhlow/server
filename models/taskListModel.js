module.exports = (sequelize, DataTypes) => {
  const Tasklist = sequelize.define(
    "tasklist",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return { Tasklist };
};
