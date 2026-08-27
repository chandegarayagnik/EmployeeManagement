import { DataTypes, Sequelize } from "sequelize";

const Employee = (sequelize) => {
  return sequelize.define(
    "Employee",
    {
      Id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },

      EmployeeId: {
        type: DataTypes.STRING(100),
        defaultValue: "",
        allowNull: true
      },

      CompanyId: {
        type: DataTypes.BIGINT,
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

      Img: {
        type: DataTypes.STRING(500),
        allowNull: true
      },

      Mobile1: {
        type: DataTypes.STRING(20),
        allowNull: true
      },

      Mobile2: {
        type: DataTypes.STRING(20),
        allowNull: true
      },

      Add1: {
        type: DataTypes.STRING(250),
        allowNull: true
      },

      Add2: {
        type: DataTypes.STRING(250),
        allowNull: true
      },

      Add3: {
        type: DataTypes.STRING(250),
        allowNull: true
      },

      PincodeId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },

      CityId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },

      StateId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },

      DOB: {
        type: DataTypes.STRING(200),
        allowNull: true
      },

      DOJ: {
        type: DataTypes.STRING(200),
        allowNull: true
      },

      Email: {
        type: DataTypes.STRING(200),
        allowNull: true
      },

      Gender: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      PAN: {
        type: DataTypes.STRING(20),
        allowNull: true
      },

      MaritalStatus: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      DepartmentId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },

      PositionId: {
        type: DataTypes.BIGINT,
        allowNull: true
      },

      Role: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      IFSC: {
        type: DataTypes.STRING(20),
        allowNull: true
      },

      BankName: {
        type: DataTypes.STRING(150),
        allowNull: true
      },

      BranchName: {
        type: DataTypes.STRING(150),
        allowNull: true
      },

      AccNo: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      AccType: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      SalaryType: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      SalaryAmount: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      IsActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },

      HighestDegree: {
        type: DataTypes.STRING(150),
        allowNull: true
      },

      DegreeName: {
        type: DataTypes.STRING(150),
        allowNull: true
      },

      UniversityName: {
        type: DataTypes.STRING(200),
        allowNull: true
      },

      PassingYear: {
        type: DataTypes.STRING(20),
        allowNull: true
      },

      UANNo: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      ESICNo: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      ShiftId: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      LicenseDate: {
        type: DataTypes.STRING(200),
        allowNull: true
      },

      PermitUsers: {
        type: DataTypes.BIGINT,
        allowNull: true
      },

      CustId: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      UserName: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      Password: {
        type: DataTypes.STRING(500),
        allowNull: true
      },

      IPAddress: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      ServerName: {
        type: DataTypes.STRING(200),
        allowNull: true
      },

      EntryTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("GETDATE()")
      },

      Flag: {
        type: DataTypes.STRING(50),
        allowNull: true
      },

      ShiftCguid: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      IsLogin: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },

      Totalhours: {
        type: DataTypes.BIGINT,
        allowNull: true
      },

      RegisterDate: {
        type: DataTypes.STRING(200),
        allowNull: true
      },

      WorkType: {
        type: DataTypes.STRING(100),
        allowNull: true
      },

      OfficeLocation: {
        type: DataTypes.STRING(250),
        allowNull: true
      },

      LocationRadius: {
        type: DataTypes.BIGINT,
        allowNull: true
      },

      IsFetchLocation: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: "EmployeeMaster",
      timestamps: false
    }
  );
};

export default Employee;