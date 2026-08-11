import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Department",
    {
      DepartmentID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
      },
      DepartmentName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      flag: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: "A",
      },
    },
    {
      tableName: "department",
      timestamps: false,
      freezeTableName: true,
    }
  );
};
