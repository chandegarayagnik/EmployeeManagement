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
        type: DataTypes.STRING,
        allowNull: true,
      },
      Clientname: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      BusinessName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Password: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Mobile1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ServerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      IPAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      CustId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      DBPassword: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      DBusername: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      IsActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      businesstype: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Entrydate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      Flag: {
        type: DataTypes.STRING,
        defaultValue: "A",
      },
      Version: {
        type: DataTypes.STRING,
        defaultValue: "1.0",
      },
      ClientAddress: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ClientCity: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      ModuleType: {
        type: DataTypes.STRING,
        defaultValue: "EmployeeManagement",
      },
      LastBackupDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      BackupStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Mobile2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      GSTno: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      LicenseType: {
        type: DataTypes.STRING,
        defaultValue: "Trial",
      },
      ProductName: {
        type: DataTypes.STRING,
        defaultValue: "Employee Management",
      },
      LicenseKey: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING,
        allowNull: true,
      },
      LicenseStatus: {
        type: DataTypes.STRING,
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
        type: DataTypes.STRING,
        defaultValue: "X",
      },
      ReceiptAmt: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      ReceiptMode: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      RenewBy: {
        type: DataTypes.STRING,
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
