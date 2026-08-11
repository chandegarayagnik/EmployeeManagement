import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Payroll",
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
      month: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      total_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      present_days: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      gross_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      net_salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      generated_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: "payroll",
      timestamps: false,
      freezeTableName: true,
    }
  );
};
