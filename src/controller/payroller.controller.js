import { dbConnection } from "../config/db.js";


// ===================== GET Payroll with JOIN ===========================
export const getPayroll = async (req, res) => {
    const { empukid, month, page, pageSize } = req.query;
    const sequelize = await dbConnection();

    try {
        let query = `
            SELECT 
                p.*, 
                e.name, 
                e.email, 
                e.position
            FROM payroll p
            INNER JOIN emp e ON p.empukid = e.empukid
            WHERE 1=1
        `;

        let countQuery = `
            SELECT COUNT(*) AS totalCount
            FROM payroll p
            INNER JOIN emp e ON p.empukid = e.empukid
            WHERE 1=1
        `;

        const replacements = {};

        if (empukid) {
            query += " AND p.empukid = :empukid";
            countQuery += " AND p.empukid = :empukid";
            replacements.empukid = empukid;
        }

        if (month) {
            query += " AND p.month = :month";
            countQuery += " AND p.month = :month";
            replacements.month = month;
        }

        query += " ORDER BY p.id DESC";

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (pageNum > 0 && pageSizeNum > 0) {
            const offset = (pageNum - 1) * pageSizeNum;
            query += ` OFFSET ${offset} ROWS FETCH NEXT ${pageSizeNum} ROWS ONLY`;
        }

        const countResult = await sequelize.query(countQuery, { replacements });
        const totalCount = countResult[0]?.totalCount || 0;

        const result = await sequelize.query(query, { replacements });

        res.status(200).json({ data: result, totalCount });

    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await sequelize.close();
    }
};


// ===================== CREATE / UPDATE Payroll ===========================
export const createPayroll = async (req, res) => {
    const {
        id,
        empukid,
        month,
        total_days,
        present_days,
        gross_salary,
        net_salary,
        generated_date,
        flag = "A"
    } = req.body;

    const sequelize = await dbConnection();

    try {
        let query = "";

        if (flag === "U") {
            query += `DELETE FROM payroll WHERE id = :id;`;
        }

        query += `
            INSERT INTO payroll
            (empukid, month, total_days, present_days, gross_salary, net_salary, generated_date)
            VALUES
            (:empukid, :month, :total_days, :present_days, :gross_salary, :net_salary, :generated_date);
        `;

        await sequelize.query(query, {
            replacements: {
                id, empukid, month, total_days, present_days,
                gross_salary, net_salary, generated_date
            }
        });

        res.status(200).json({
            message: flag === "A" ? "Payroll Created Successfully" : "Payroll Updated Successfully",
            Success: true
        });

    } catch (error) {
        res.status(500).json({ message: error.message, Success: false });
    } finally {
        await sequelize.close();
    }
};


// ===================== DELETE Payroll ===========================
export const deletePayroll = async (req, res) => {
    const { id } = req.params;
    const sequelize = await dbConnection();

    try {
        await sequelize.query(
            "DELETE FROM payroll WHERE id = :id",
            { replacements: { id } }
        );

        res.status(200).json({ message: "Payroll deleted successfully", Success: true });

    } catch (error) {
        res.status(500).json({ message: error.message, Success: false });
    } finally {
        await sequelize.close();
    }
};
