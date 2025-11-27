import { dbConnection } from "../config/db.js";

export const getdepartment = async (req, res) => {
    const { DepartmentID, DepartmentName, page, pageSize } = req.query
    const sequelize = await dbConnection()
    try {

        let query = `SELECT * FROM department WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) as totalCount FROM department WHERE 1=1`;
        const replacements = {};

        if (DepartmentID) {
            query += ` AND DepartmentID= :DepartmentID`;
            countQuery += ` AND DepartmentID= :DepartmentID`;
            replacements.DepartmentID = DepartmentID
            console.log("D Id => ", query);
            console.log("=> ", countQuery);

        }

        if (DepartmentName) {
            query += ` AND DepartmentName LIKE :DepartmentName`;
            countQuery += ` AND DepartmentName LIKE :DepartmentName`;
            replacements.DepartmentName = `%${DepartmentName}%`
            console.log("Name => ", query);
            console.log("", countQuery);

        }

        query += " ORDER BY DepartmentID ASC";

        const [countresult] = await sequelize.query(countQuery, { replacements });
        const totalCount = countresult[0]?.totalCount || 0;

        // Apply The Pagination 
        const pageNum = parseInt(page, 10)
        const pageSizeNum = parseInt(pageSize, 10)

        if (!isNaN(pageNum) && !isNaN(pageSizeNum) && pageNum > 0 && pageSizeNum > 0) {
            const offset = (pageNum - 1) * pageSizeNum
            query += ` OFFSET ${offset} ROWS FETCH NEXT ${pageSizeNum} ROWS ONLY `;
            replacements.offset = offset
            replacements.pageSize = pageSizeNum
            console.log("Pagination => ", query);
        }

        const [result] = await sequelize.query(query, { replacements });

        console.log("Replacement => ", replacements);

        res.status(200).json({ data: result[0], totalCount })
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log(error);
    } finally {
        await sequelize.close()
    }
}

export const createdepartment = async (req, res) => {
    const { DepartmentID, DepartmentName, flag = "A" } = req.body;

    const sequelize = await dbConnection();

    try {

        let query = "";

        if (flag === "U") {
            query += ` 
        DELETE FROM department WHERE DepartmentID = :DepartmentID;
      `;
        }

        query += `
      INSERT INTO department
      (DepartmentID, DepartmentName, flag)
      VALUES
      (:DepartmentID, :DepartmentName, :flag);
    `;

        await sequelize.query(query, {
            replacements: {
                DepartmentID, DepartmentName, flag
            },
        });

        res.status(200).json({
            message:
                flag === "A" ? "Add Department SuccessFully" : "Update Department SuccessFully", Success: true
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message, Success: false });
    } finally {
        await sequelize.close();
    }
};

export const deletedepartment = async (req, res) => {
    const { DepartmentID } = req.params;
    const sequelize = await dbConnection()

    try {
        const query = `Delete From department where DepartmentID = :DepartmentID;`
        const result = await sequelize.query(query, { replacements: { DepartmentID } });
        if (result[1] === 0) {
            return res.status(404).json({ message: "Department Not Found" })
        }

        res.status(200).json({ message: "Delete Department successFully", Success: true })
    } catch (error) {
        res.status(500).json({ message: error.message, Success: false })
    } finally {
        await sequelize.close()
    }
}
