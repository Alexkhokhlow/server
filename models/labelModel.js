module.exports = (sequelize, DataTypes) => {
  const Label = sequelize.define(
    "label",
    {
      color: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      text: {
        type: DataTypes.STRING,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      index : {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      }
    },
    { timestamps: true }
  );

  return { Label };
};
