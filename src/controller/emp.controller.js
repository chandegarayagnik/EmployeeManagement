import fs from "fs";
import path from "path";

export const getEmp = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { empukid, name, position, salary, DepartmentID, page, pageSize } = req.query;

        // 1. INITIALIZE QUERIES
        let query = "SELECT * FROM emp WITH (NOLOCK) WHERE 1=1";
        let countQuery = "SELECT COUNT(*) AS total FROM emp WITH (NOLOCK) WHERE 1=1";
        const replacements = {};

        // 2. DYNAMIC FILTER MAPPING
        if (empukid) {
            const condition = " AND empukid = :empukid";
            query += condition;
            countQuery += condition;
            replacements.empukid = empukid;
        }

        if (name) {
            const condition = " AND name LIKE :name";
            query += condition;
            countQuery += condition;
            replacements.name = `%${name}%`;
        }

        if (position) {
            const condition = " AND position LIKE :position";
            query += condition;
            countQuery += condition;
            replacements.position = `%${position}%`;
        }

        if (salary) {
            const condition = " AND salary = :salary";
            query += condition;
            countQuery += condition;
            replacements.salary = salary;
        }

        if (DepartmentID) {
            const condition = " AND DepartmentID = :DepartmentID";
            query += condition;
            countQuery += condition;
            replacements.DepartmentID = DepartmentID;
        }

        // 3. ORDER BY
        query += " ORDER BY empukid DESC";

        // 4. GET TOTAL COUNT
        const [countResult] = await sequelize.query(countQuery, { replacements });
        const totalCount = countResult[0]?.total || 0;

        // 5. APPLY PAGINATION LOGIC
        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (!isNaN(pageNum) && !isNaN(pageSizeNum) && pageNum > 0 && pageSizeNum > 0) {
            const offset = (pageNum - 1) * pageSizeNum;
            query += " OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
            replacements.offset = offset;
            replacements.limit = pageSizeNum;
        }

        // 6. EXECUTE DATA QUERY
        const [results] = await sequelize.query(query, { replacements });

        // 7. FINAL RESPONSE
        return res.status(200).json({
            data: results,
            total: totalCount,
            page: pageNum || null,
            limit: pageSizeNum || null,
            success: true,
        });
    } catch (error) {
        console.error("EMPLOYEE LISTING ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Database error",
            error: error.message,
        });
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
};

export const listEmpById = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { empukid } = req.params;
        const [result] = await sequelize.query(
            "SELECT * FROM emp WITH (NOLOCK) WHERE empukid = :empukid",
            { replacements: { empukid } }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: result[0],
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
};

export const createEmp = async (req, res) => {
    const { Employee } = req.db.models;
    const { sequelize } = req.db;
    try {
        const flag = req.body.Flag || req.body.flag || "A";
        const empphoto = req.files?.empphoto?.[0]?.filename || req?.body?.empphoto || null;

        if (flag === "A") {
            await Employee.create({
                ...req.body,
                empphoto,
                flag: "A",
            });
            return res.status(200).json({
                success: true,
                message: "Employee Create SuccessFully",
            });
        } else if (flag === "U") {
            const oldRecord = await Employee.findOne({ where: { empukid: req.body.empukid } });
            const oldPhoto = oldRecord ? oldRecord.empphoto : null;

            await Employee.update(
                {
                    ...req.body,
                    empphoto: empphoto || oldPhoto,
                    flag: "U",
                },
                { where: { empukid: req.body.empukid } }
            );

            if (req.files?.empphoto && oldPhoto && oldPhoto !== empphoto) {
                const oldPath = path.join("./media", oldPhoto);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }

            return res.status(200).json({
                success: true,
                message: "Employee Updated Successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Flag value. Use 'A' for Add and 'U' for Update.",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
};

export const updateEmp = createEmp;

export const getEmpPhoto = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { empukid } = req.params;
        const [result] = await sequelize.query(
            "SELECT empphoto FROM emp WITH (NOLOCK) WHERE empukid = :empukid",
            { replacements: { empukid } }
        );

        if (!result || !result[0] || !result[0].empphoto) {
            return res.status(404).json({ success: false, message: "Employee Photo Not Found" });
        }

        const filePath = path.resolve("./media", result[0].empphoto);
        return res.download(filePath);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
};

export const deleteEmp = async (req, res) => {
    const { Employee } = req.db.models;
    const { sequelize } = req.db;
    try {
        const { empukid } = req.params;
        const empRecord = await Employee.findOne({ where: { empukid } });

        if (!empRecord) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        if (empRecord.empphoto) {
            const oldPath = path.join("./media", empRecord.empphoto);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        const result = await Employee.destroy({
            where: { empukid },
        });

        return res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        if (sequelize) {
            await sequelize.close();
        }
    }
};
