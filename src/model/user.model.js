import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userukid: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      mobile: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "users",
      timestamps: false,
      freezeTableName: true,
    }
  );
};
