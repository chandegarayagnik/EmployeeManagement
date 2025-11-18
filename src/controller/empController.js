import { dbConnection } from "../config/db.js";

export const getEmp = async (req, res) => {
    const { id, name, position, salary, page, pageSize } = req.query
    const sequelize = await dbConnection()
    try {

        let query = `SELECT * FROM emp WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) as totalCount FROM emp WHERE 1=1`;
        const replacements = {};

        if (id) {
            query += ` AND id=${id}`;
            countQuery += ` AND id=${id}`;
            replacements.id = id
            console.log("Id => ", query);
        }

        if (name) {
            query += ` AND name LIKE '%${name}%'`;
            countQuery += ` AND name LIKE '%${name}%'`;
            replacements.name = name
            console.log("Name => ", query);
        }

        if (position) {
            query += ` AND position LIKE '%${position}%'`;
            countQuery += ` AND position LIKE '%${position}%'`;
            replacements.position = position
            console.log("Position => ", query);
        }

        if (salary) {
            query += `AND salary=${salary}`;
            countQuery += `AND salary=${salary}`
            replacements.salary = salary
            console.log("salary => ", query);

        }

        query += " ORDER BY id DESC";

        const countresult = await sequelize.query(countQuery, { replacements });
        const totalCount = countresult.recordset[0].totalCount || 0;

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

        const result = await sequelize.query(query, { replacements });

        console.log("Replacement => ", replacements);

        res.status(200).json({ data: result.recordset, totalCount })
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log(error);
    } finally {
        await sequelize.close()
    }
}

export const createEmp = async (req, res) => {
    const { empukid, name, position, salary, flag = "A" } = req.body
    const sequelize = await dbConnection()
    try {
        let query = ""

        if (flag === "U") {
            query += `delete from emp where empukid='${empukid}'`
        }

        query += `insert into emp(empukid, name, position, salary) values('${empukid}','${name}', '${position}','${salary}')`

        await sequelize.query(query)
        res.status(200).json({ message: flag === "A" ? "Employee Create SuccessFully" : "Employee Update SucessFully", success: true })
    } catch (error) {
        res.status(500).json({ message: error.message })
    } finally {
        await sequelize.close()
    }
}

export const deleteEmp = async (req, res) => {
    const { empukid } = req.params;
    const sequelize = await dbConnection()

    try {
        const query = `Delete From emp where empukid = :empukid`
        const result = await sequelize.query(query, { replacements: { empukid } });
        res.status(200).json({ message: "Employee delete successFully", Success: true })
    } catch (error) {
        res.status(500).json({ message: error.message, Success: false })
    } finally {
        await sequelize.close()
    }
}
