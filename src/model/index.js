import UserModel from "./user.model.js";
import DepartmentModel from "./depart.model.js";
import EmployeeModel from "./emp.model.js";
import AttendanceModel from "./attendance.model.js";
import SalaryModel from "./salary.model.js";
import PayrollModel from "./payroll.model.js";
import RegistrationModel from "./Registration.js";
import CompanyModel from "./company.model.js";

export const loadModels = (sequelize) => {

  const models = {};

  models.User = UserModel(sequelize);
  models.Department = DepartmentModel(sequelize);
  models.Employee = EmployeeModel(sequelize);
  models.Attendance = AttendanceModel(sequelize);
  models.Salary = SalaryModel(sequelize);
  models.Payroll = PayrollModel(sequelize);
  models.Registration = RegistrationModel(sequelize);
  models.Company = CompanyModel(sequelize);

  return models;
};


