import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Registration",
    {
      ClientId: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      ClientUkeyId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      Clientname: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      BusinessName: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      Username: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      Password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      Mobile1: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      Email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      ServerName: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      IPAddress: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      CustId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      DBPassword: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      DBusername: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      businesstype: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      Entrydate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      Flag: {
        type: DataTypes.STRING(10),
        defaultValue: "A",
      },
      Version: {
        type: DataTypes.STRING(20),
        defaultValue: "1.0",
      },
      ClientAddress: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      ClientCity: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ModuleType: {
        type: DataTypes.STRING(100),
        defaultValue: "EmployeeManagement",
      },
      LastBackupDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      BackupStatus: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      Mobile2: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      GSTno: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      LicenseType: {
        type: DataTypes.STRING(50),
        defaultValue: "Trial",
      },
      ProductName: {
        type: DataTypes.STRING(100),
        defaultValue: "Employee Management",
      },
      LicenseKey: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      ActivationDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ExpiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      LastRenewDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      NextRenewDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      IsLifetime: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      Remark1: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      LicenseStatus: {
        type: DataTypes.STRING(50),
        defaultValue: "Trial",
      },
      MaxUsers: {
        type: DataTypes.INTEGER,
        defaultValue: 5,
      },
      MaxCompanies: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
      },
      MaxFirms: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
      },
      MaxInvoicesPerMonth: {
        type: DataTypes.INTEGER,
        defaultValue: 100,
      },
      CanUseMobileApp: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      CanUseAPI: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      PrioritySupport: {
        type: DataTypes.STRING(10),
        defaultValue: "N",
      },
      ReceiptAmt: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      ReceiptMode: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      RenewBy: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
    },
    {
      tableName: "Registration",
      timestamps: false,
      freezeTableName: true,
    }
  );
};
