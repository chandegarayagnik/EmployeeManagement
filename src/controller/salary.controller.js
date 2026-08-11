export const getSalary = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { empukid, page, pageSize } = req.query;

        // 1. INITIALIZE QUERIES
        let query = `
            SELECT s.*, e.name, e.email, e.position 
            FROM salary s WITH (NOLOCK)
            LEFT JOIN emp e WITH (NOLOCK) ON s.empukid = e.empukid
            WHERE 1=1
        `;
        let countQuery = `
            SELECT COUNT(*) AS total 
            FROM salary s WITH (NOLOCK)
            LEFT JOIN emp e WITH (NOLOCK) ON s.empukid = e.empukid
            WHERE 1=1
        `;
        const replacements = {};

        // 2. DYNAMIC FILTER MAPPING
        if (empukid) {
            const condition = " AND s.empukid = :empukid";
            query += condition;
            countQuery += condition;
            replacements.empukid = empukid;
        }

        // 3. ORDER BY
        query += " ORDER BY s.id DESC";

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
        console.error("SALARY LISTING ERROR:", error);
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

export const listSalaryById = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { id } = req.params;
        const [result] = await sequelize.query(
            `SELECT s.*, e.name, e.email, e.position 
             FROM salary s WITH (NOLOCK)
             LEFT JOIN emp e WITH (NOLOCK) ON s.empukid = e.empukid
             WHERE s.id = :id`,
            { replacements: { id } }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Salary record not found",
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

export const createSalary = async (req, res) => {
    const { Salary, Employee } = req.db.models;
    const { sequelize } = req.db;

    try {
        const flag = req.body.Flag || req.body.flag || "A";

        if (flag === "A") {
            const empRecord = await Employee.findOne({ where: { empukid: req.body.empukid } });
            const basic = req.body.basic || (empRecord ? empRecord.salary : 0);

            await Salary.create({
                ...req.body,
                basic,
            });
            return res.status(200).json({
                success: true,
                message: "Salary Created Successfully",
            });
        } else if (flag === "U") {
            await Salary.update(
                { ...req.body },
                { where: { id: req.body.id } }
            );

            return res.status(200).json({
                success: true,
                message: "Salary Updated Successfully",
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

export const deleteSalary = async (req, res) => {
    const { Salary } = req.db.models;
    const { sequelize } = req.db;

    try {
        const { id } = req.params;
        const result = await Salary.destroy({
            where: { id },
        });

        if (result === 0) {
            return res.status(404).json({
                success: false,
                message: "Salary record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Salary deleted successfully",
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
