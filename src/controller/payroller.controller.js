import { dbConnection } from "../config/db.js";

// ===================== GENERATE PAYROLL ===========================
export const generatePayroll = async (req, res) => {
    const { empukid, month, total_days, present_days } = req.body;

    const sequelize = await dbConnection();
    try {
        
       const checkQuery = `
       SELECT COUNT(*) AS count
       FROM payroll
       WHERE empukid = :empukid
       AND month = :month
       `;

       console.log("check Query => ", checkQuery);

        const [checkResult] = await sequelize.query(checkQuery, {
            replacements: { empukid, month }
        });

        console.log("check RESULT => ", checkResult);
        
        if (checkResult[0].count > 0) {
            return res.status(400).json({
                error: "Payroll Already Created For This Employee And Month",
                Success: false
            });
            
        }

        const salaryQuery = `
        SELECT basic, hra, bonus, deduction
        FROM salary
        WHERE empukid = :empukid
        `;

        const [salaryRows] = await sequelize.query(salaryQuery, {
            replacements: { empukid }
        });

        //  Check Payroll Already Exists


        if (!salaryRows || salaryRows.length === 0) {
            return res.status(404).json({
                message: "Salary record not found for this employee"
            });
        }

        const { basic, hra, bonus, deduction } = salaryRows[0];

        const gross_salary = (basic + hra + bonus).toFixed(2);
        const net_salary = (gross_salary - deduction).toFixed(2);


        const insertQuery = `
            INSERT INTO payroll
            (empukid, month, total_days, present_days, gross_salary, net_salary, generated_date)
            VALUES
            (:empukid, :month, :total_days, :present_days, :gross_salary, :net_salary, GETDATE())
        `;

        await sequelize.query(insertQuery, {
            replacements: {
                empukid,
                month,
                total_days,
                present_days,
                gross_salary,
                net_salary,
            }
        });

        res.status(200).json({
            message: "Payroll Generated Successfully",
            data: {
                empukid,
                month,
                total_days,
                present_days,
                gross_salary,
                net_salary,
            },
            Success: true
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    } finally {
        await sequelize.close();
    }
};
