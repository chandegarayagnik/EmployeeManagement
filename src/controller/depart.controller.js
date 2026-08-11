export const getdepartment = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { DepartmentID, DepartmentName, flag, page, pageSize } = req.query;

        // 1. INITIALIZE QUERIES
        let query = "SELECT * FROM department WITH (NOLOCK) WHERE 1=1";
        let countQuery = "SELECT COUNT(*) AS total FROM department WITH (NOLOCK) WHERE 1=1";
        const replacements = {};

        // 2. DYNAMIC FILTER MAPPING
        if (DepartmentID) {
            const condition = " AND DepartmentID = :DepartmentID";
            query += condition;
            countQuery += condition;
            replacements.DepartmentID = DepartmentID;
        }

        if (DepartmentName) {
            const condition = " AND DepartmentName LIKE :DepartmentName";
            query += condition;
            countQuery += condition;
            replacements.DepartmentName = `%${DepartmentName}%`;
        }

        if (flag) {
            const condition = " AND flag = :flag";
            query += condition;
            countQuery += condition;
            replacements.flag = flag;
        }

        // 3. ORDER BY
        query += " ORDER BY DepartmentID ASC";

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
        console.error("DEPARTMENT LISTING ERROR:", error);
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

export const listDepartmentById = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { DepartmentID } = req.params;
        const [result] = await sequelize.query(
            "SELECT * FROM department WITH (NOLOCK) WHERE DepartmentID = :DepartmentID",
            { replacements: { DepartmentID } }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
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

export const createdepartment = async (req, res) => {
    const { Department } = req.db.models;
    const { sequelize } = req.db;

    try {
        const flag = req.body.Flag || req.body.flag || "A";

        if (flag === "A") {
            await Department.create({
                ...req.body,
                flag: "A",
            });
            return res.status(200).json({
                success: true,
                message: "Department added successfully",
            });
        } else if (flag === "U") {
            const [updatedCount] = await Department.update(
                { ...req.body, flag: "U" },
                { where: { DepartmentID: req.body.DepartmentID } }
            );

            if (updatedCount === 0) {
                // If not updated, attempt create or return not found
                await Department.create({ ...req.body, flag: "U" });
            }

            return res.status(200).json({
                success: true,
                message: "Department Update Successfully",
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

export const deletedepartment = async (req, res) => {
    const { Department } = req.db.models;
    const { sequelize } = req.db;

    try {
        const { DepartmentID } = req.params;
        const result = await Department.destroy({
            where: { DepartmentID },
        });

        if (result === 0) {
            return res.status(404).json({
                success: false,
                message: "Department not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully",
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
