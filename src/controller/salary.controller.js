import { dbConnection } from "../config/db.js";


// ===================== GET Salary with JOIN ===========================
export const getSalary = async (req, res) => {
    const { empukid, page, pageSize } = req.query;
    const sequelize = await dbConnection();

    try {
        let query = `
            SELECT 
                s.*, 
                e.name, 
                e.email, 
                e.position
            FROM salary s
            INNER JOIN emp e ON s.empukid = e.empukid
            WHERE 1=1
        `;

        let countQuery = `
            SELECT COUNT(*) AS totalCount
            FROM salary s
            INNER JOIN emp e ON s.empukid = e.empukid
            WHERE 1=1
        `;

        const replacements = {};

        if (empukid) {
            query += " AND s.empukid = :empukid";
            countQuery += " AND s.empukid = :empukid";
            replacements.empukid = empukid;
        }

        query += " ORDER BY s.id DESC";

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


// ===================== CREATE / UPDATE Salary ===========================
export const createSalary = async (req, res) => {
    const { id, empukid, basic, hra, bonus, deduction, flag = "A" } = req.body;
    const sequelize = await dbConnection();

    try {
        let query = "";

        if (flag === "U") {
            query += `
                DELETE FROM salary WHERE id = :id;
            `;
        }

        query += `
            INSERT INTO salary
            (empukid, basic, hra, bonus, deduction)
            VALUES
            (:empukid, :basic, :hra, :bonus, :deduction);
        `;

        await sequelize.query(query, {
            replacements: { id, empukid, basic, hra, bonus, deduction }
        });

        res.status(200).json({
            message: flag === "A" ? "Salary Created Successfully" : "Salary Updated Successfully",
            Success: true
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    } finally {
        await sequelize.close();
    }
};


// ===================== DELETE Salary ===========================
export const deleteSalary = async (req, res) => {
    const { id } = req.params;
    const sequelize = await dbConnection();

    try {
        await sequelize.query(
            "DELETE FROM salary WHERE id = :id",
            { replacements: { id } }
        );

        res.status(200).json({ message: "Salary deleted successfully", Success: true });

    } catch (error) {
        res.status(500).json({ message: error.message, Success: false });
    } finally {
        await sequelize.close();
    }
};
