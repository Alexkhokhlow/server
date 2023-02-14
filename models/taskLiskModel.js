module.exports = (sequelize, DataTypes) => {
  const TaskList = sequelize.define(
    "tasklist",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      color: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pathName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      public: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
    },
    { timestamps: true }
  );

  return { DashBoard };
};
