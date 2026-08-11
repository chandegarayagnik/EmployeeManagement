import sequelize from "../config/db.js";
import UserModel from "./user.model.js";
import DepartmentModel from "./depart.model.js";
import EmployeeModel from "./emp.model.js";
import AttendanceModel from "./attendance.model.js";
import SalaryModel from "./salary.model.js";
import PayrollModel from "./payroll.model.js";
import RegistrationModel from "./Registration.js";

export const loadModels = (sequelizeInstance) => {
  if (!sequelizeInstance || typeof sequelizeInstance.define !== "function") {
    console.error("loadModels error: sequelizeInstance is not a valid Sequelize instance");
    return {};
  }

  const models = {};

  models.User = UserModel(sequelizeInstance);
  models.Department = DepartmentModel(sequelizeInstance);
  models.Employee = EmployeeModel(sequelizeInstance);
  models.Attendance = AttendanceModel(sequelizeInstance);
  models.Salary = SalaryModel(sequelizeInstance);
  models.Payroll = PayrollModel(sequelizeInstance);
  models.Registration = RegistrationModel(sequelizeInstance);
  models.Registartion = RegistrationModel(sequelizeInstance);

  return models;
};

const initializedModels = loadModels(sequelize);

export const User = initializedModels.User;
export const Department = initializedModels.Department;
export const Employee = initializedModels.Employee;
export const Attendance = initializedModels.Attendance;
export const Salary = initializedModels.Salary;
export const Payroll = initializedModels.Payroll;
export const Registration = initializedModels.Registration;
export const Registartion = initializedModels.Registration;

export default initializedModels;
