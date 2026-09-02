import { DataTypes } from "sequelize";

export default (sequelize) => {
  return sequelize.define(
    "Attendance",
    {
      AttendenceID: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },

      AttendenceDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      CompanyId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      EmpId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      InTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      OutTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      IsonLeave: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      LateBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
      },

      EarlyBy: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0,
      },

      LeaveType: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      Holiday: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      LeaveId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      ShiftId: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },

      Present: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      Absent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      Cguid: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },

      Flag: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      IPAddress: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      ServerName: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },

      EntryTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: DataTypes.NOW,
      },

      CustId: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      Longitude: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      Latitude: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      Location: {
        type: DataTypes.STRING(250),
        allowNull: true,
      },

      Device: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },

      LeaveCguid: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },

      ShiftmstCguid: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },

      LeaveTypeCguid: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },

      TodayAbsent: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      WeekOff: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      Img: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },

      AttendanceImage: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
    },
    {
      tableName: "Attendance",
      timestamps: false,
    }
  );
};


