import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Salary",
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
      basic: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      hra: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      bonus: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      deduction: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      tableName: "salary",
      timestamps: false,
      freezeTableName: true,
    }
  );
};
