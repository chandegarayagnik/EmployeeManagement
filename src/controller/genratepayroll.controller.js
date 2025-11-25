import { dbConnection } from "../config/db.js";
import moment from "moment";

export const generatePayroll = async (req, res) => {
    const { empukid, month } = req.body;
    const sequelize = await dbConnection();

    try {
        // 1. Get Salary Structure
        const [salaryRows] = await sequelize.query(
            `SELECT * FROM salary WHERE empukid=:empukid`,
            { replacements: { empukid } }
        );

        if (!salaryRows.length)
            return res.status(400).json({ message: "Salary not set for employee" });

        const salary = salaryRows[0];

        // 2. Attendance Summary for Month
        const startDate = moment(month + "-01");
        const endDate = startDate.clone().endOf("month");

        const [attRows] = await sequelize.query(
            `SELECT COUNT(*) AS presentDays 
             FROM attendance 
             WHERE empukid=:empukid AND status='Present' 
             AND date BETWEEN :startDate AND :endDate`,
            {
                replacements: {
                    empukid,
                    startDate: startDate.format("YYYY-MM-DD"),
                    endDate: endDate.format("YYYY-MM-DD"),
                },
            }
        );

        const presentDays = attRows[0].presentDays;
        const totalDays = endDate.date();

        // 3. Salary Calculation
        const gross = salary.basic + salary.hra + salary.bonus;
        const net = gross - salary.deduction;

        // 4. Insert Payroll
        const [result] = await sequelize.query(
            `INSERT INTO payroll 
            (empukid, month, total_days, present_days, gross_salary, net_salary, generated_date)
            OUTPUT INSERTED.id
            VALUES 
            (:empukid, :month, :total_days, :present_days, :gross_salary, :net_salary, GETDATE())`,
            {
                replacements: {
                    empukid,
                    month,
                    total_days: totalDays,
                    present_days: presentDays,
                    gross_salary: gross,
                    net_salary: net,
                },
            }
        );

        console.log(result[0]);
        

        const payrollId = result[0].id;
        console.log(payrollId);
        

        res.status(200).json({
            message: "Payroll generated successfully",
            payrollId,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    } finally {
        await sequelize.close();
    }
};
