import { dbConnection } from "../config/db.js";


export const getAttendance = async (req, res) => {
    const { empukid, date, status, page, pageSize } = req.query;
    const sequelize = await dbConnection();

    try {
        let query = `
            SELECT 
                a.*, 
                e.name, 
                e.email, 
                e.position, 
                e.salary 
            FROM attendance a
            INNER JOIN emp e ON a.empukid = e.empukid
            WHERE 1=1
        `;

        let countQuery = `
            SELECT COUNT(*) AS totalCount 
            FROM attendance a
            INNER JOIN emp e ON a.empukid = e.empukid
            WHERE 1=1
        `;

        const replacements = {};


        if (empukid) {
            query += ` AND a.empukid = :empukid`;
            countQuery += ` AND a.empukid = :empukid`;
            replacements.empukid = empukid;
        }


        if (date) {
            query += ` AND a.date = :date`;
            countQuery += ` AND a.date = :date`;
            replacements.date = date;
        }


        if (status) {
            query += ` AND a.status = :status`;
            countQuery += ` AND a.status = :status`;
            replacements.status = status;
        }

        query += ` ORDER BY a.date DESC, a.check_in ASC`;

        // Pagination
        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (!isNaN(pageNum) && !isNaN(pageSizeNum)) {
            const offset = (pageNum - 1) * pageSizeNum;
            query += ` OFFSET ${offset} ROWS FETCH NEXT ${pageSizeNum} ROWS ONLY`;
        }

        const [countResult] = await sequelize.query(countQuery, { replacements });
        const totalCount = countResult[0]?.totalCount || 0;
        
        const [result] = await sequelize.query(query, { replacements });

        res.status(200).json({ data: result, totalCount });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    } finally {
        await sequelize.close();
    }
};

export const createAttendance = async (req, res) => {
    const { id, empukid, date, check_in, check_out, status, flag = "A" } = req.body;
    const sequelize = await dbConnection();

    try {
        let query = "";

        if (flag === "U") {
            // Delete existing record before update
            query += `
                DELETE FROM attendance WHERE id = :id;
            `;
        }

        query += `
            INSERT INTO attendance 
            (empukid, date, check_in, check_out, status)
            VALUES
            (:empukid, :date, :check_in, :check_out, :status);
        `;

        await sequelize.query(query, {
            replacements: { id, empukid, date, check_in, check_out, status }
        });

        res.status(200).json({
            message: flag === "A" ? "Attendance Created Successfully" : "Attendance Updated Successfully",
            Success: true
        });

    } catch (error) {
        res.status(500).json({ error: error.message, Success: false });
    } finally {
        await sequelize.close();
    }
};

export const deleteAttendance = async (req, res) => {
    const { id } = req.params;
    const sequelize = await dbConnection();

    try {
        const query = `DELETE FROM attendance WHERE id = :id`;
        await sequelize.query(query, { replacements: { id } });

        res.status(200).json({ message: "Attendance deleted successfully", Success: true });

    } catch (error) {
        res.status(500).json({ message: error.message, Success: false });
    } finally {
        await sequelize.close();
    }
};
