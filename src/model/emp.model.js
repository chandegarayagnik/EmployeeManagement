import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Employee",
    {
      empukid: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      salary: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      DepartmentID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      empphoto: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      join_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      flag: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: "A",
      },
    },
    {
      tableName: "emp",
      timestamps: false,
      freezeTableName: true,
    }
  );
};
