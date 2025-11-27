import { dbConnection } from "../config/db.js";


export const createEmp = async (req, res) => {
    const { empukid, name, email, position, salary, phone, join_date, DepartmentID } = req.body;
    
    const sequelize = await dbConnection();
    
    try {
        
        if (flag === "A") {
            const [emailCheck] = await sequelize.query(
                `SELECT email FROM emp WHERE email = :email`,
                { replacements: { email } }
            );
            
            if (emailCheck.length > 0) {
                return res.status(400).json({
                    error: "Email already exists",
                    Success: false
                });
            }
        }
        
        let query = "";
        
        if (flag === "U") {
            query += ` 
            DELETE FROM emp WHERE empukid = :empukid;
            `;
        }
        
        query += `
        INSERT INTO emp
        (empukid, name, email, position, salary, flag, phone, join_date, DepartmentID)
        VALUES
        (:empukid, :name, :email, :position, :salary, :flag, :phone, :join_date, :DepartmentID);
        `;
        
        await sequelize.query(query, {
            replacements: {
                empukid, name, email, position, salary, flag, phone, join_date, DepartmentID
            },
        });
        
        res.status(200).json({
            message:
            flag === "A" ? "Employee Create SuccessFully" : "Employee Update SuccessFully", Success: true
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.errors[0].message, Success: false });
    } finally {
        await sequelize.close();
    }
};

export const getEmp = async (req, res) => {
    const { empukid, name, position, salary, page, pageSize } = req.query;
    const sequelize = await dbConnection()
    try {

        let query = `SELECT * FROM emp WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) as totalCount FROM emp WHERE 1=1`;
        const replacements = {};

        if (empukid) {
            query += ` AND empukid= :empukid`;
            countQuery += ` AND empukid= :empukid`;
            replacements.empukid = empukid;
            console.log("Id => ", query);
        }

        if (name) {
            query += ` AND name LIKE :name`;
            countQuery += ` AND name LIKE :name`;
            replacements.name = `%${name}%`
            console.log("Name => ", query);
            console.log(countQuery);

        }

        if (position) {
            query += ` AND position LIKE :position`;
            countQuery += ` AND position LIKE :position`;
            replacements.position = `%${position}%`
            console.log("Position => ", query);
        }

        if (salary) {
            query += ` AND salary= :salary`;
            countQuery += ` AND salary= :salary`
            replacements.salary = salary
            console.log("salary => ", query);

        }

        query += " ORDER BY empukid DESC";

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

        res.status(200).json({ data: result, totalCount })
    } catch (error) {
        res.status(500).json({ message: error.message })
        console.log(error);
    } finally {
        await sequelize.close()
    }
} 

export const deleteEmp = async (req, res) => {
    const { empukid } = req.params;
    const sequelize = await dbConnection()

    try {
        const query = `Delete From emp where empukid = :empukid;`
        const result = await sequelize.query(query, { replacements: { empukid } });
        res.status(200).json({ message: "Employee delete successFully", Success: true })
    } catch (error) {
        res.status(500).json({ message: error.message, Success: false })
    } finally {
        await sequelize.close()
    }
}
