module.exports = (sequelize, DataTypes) => {
  const CheckList = sequelize.define(
    "checkList",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { timestamps: true }
  );

  return { CheckList };
};
