module.exports = (sequelize, DataTypes) => {
  const Labels = sequelize.define(
    "labels",
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
        allowNull: false,
      },
      dashboardId : {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    },
    { timestamps: true }
  );

  return { Labels };
};
