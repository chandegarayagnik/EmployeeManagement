import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Attendance",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      empukid: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      check_in: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      check_out: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      tableName: "attendance",
      timestamps: false,
      freezeTableName: true,
    }
  );
};
