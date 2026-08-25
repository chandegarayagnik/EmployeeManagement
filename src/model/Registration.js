import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Registration",
    {
      Id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      ClientUkeyId: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      CustId: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      FirstName: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      LastName: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      Mobile: {
        type: DataTypes.STRING(20),
        allowNull: true
      },

      Email: {
        type: DataTypes.STRING(200),
        allowNull: true
      },

      Username: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      Password: {
        type: DataTypes.STRING(500),
        allowNull: true
      },

      Role: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      IsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      IsDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      LicenseDate: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      IPAddress: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      Device: {
        type: DataTypes.STRING(200),
        allowNull: true
      },

      ReferenceBy: {
        type: DataTypes.STRING(100),
        allowNull: true
      }
    },

    {
      tableName: "Registration",
      timestamps: false,
      freezeTableName: true,
    }
  );
};
