export const listPayroll = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { empukid, month, page, pageSize } = req.query;

        // 1. INITIALIZE QUERIES
        let query = `
            SELECT p.*, e.name, e.email, e.position 
            FROM payroll p WITH (NOLOCK)
            LEFT JOIN emp e WITH (NOLOCK) ON p.empukid = e.empukid
            WHERE 1=1
        `;
        let countQuery = `
            SELECT COUNT(*) AS total 
            FROM payroll p WITH (NOLOCK)
            LEFT JOIN emp e WITH (NOLOCK) ON p.empukid = e.empukid
            WHERE 1=1
        `;
        const replacements = {};

        // 2. DYNAMIC FILTER MAPPING
        if (empukid) {
            const condition = " AND p.empukid = :empukid";
            query += condition;
            countQuery += condition;
            replacements.empukid = empukid;
        }

        if (month) {
            const condition = " AND p.month = :month";
            query += condition;
            countQuery += condition;
            replacements.month = month;
        }

        // 3. ORDER BY
        query += " ORDER BY p.id DESC";

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
        console.error("PAYROLL LISTING ERROR:", error);
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

export const listPayrollById = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { id } = req.params;
        const [result] = await sequelize.query(
            `SELECT p.*, e.name, e.email, e.position 
             FROM payroll p WITH (NOLOCK)
             LEFT JOIN emp e WITH (NOLOCK) ON p.empukid = e.empukid
             WHERE p.id = :id`,
            { replacements: { id } }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found",
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

export const generatePayroll = async (req, res) => {
    const { Payroll, Salary } = req.db.models;
    const { sequelize } = req.db;

    try {
        const flag = req.body.Flag || req.body.flag || "A";
        const { empukid, month, total_days, present_days } = req.body;

        if (flag === "A") {
            const existingCount = await Payroll.count({
                where: { empukid, month },
            });

            if (existingCount > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Payroll Already Created For This Employee And Month",
                });
            }

            const salaryRecord = await Salary.findOne({ where: { empukid } });

            if (!salaryRecord) {
                return res.status(404).json({
                    success: false,
                    message: "Salary record not found for this employee",
                });
            }

            const basic = parseFloat(salaryRecord.basic) || 0;
            const hra = parseFloat(salaryRecord.hra) || 0;
            const bonus = parseFloat(salaryRecord.bonus) || 0;
            const deduction = parseFloat(salaryRecord.deduction) || 0;

            const gross_salary = (basic + hra + bonus).toFixed(2);
            const net_salary = (gross_salary - deduction).toFixed(2);

            const result = await Payroll.create({
                empukid,
                month,
                total_days,
                present_days,
                gross_salary,
                net_salary,
                generated_date: new Date(),
            });

            return res.status(200).json({
                success: true,
                message: "Payroll Generated Successfully",
                data: result,
            });
        } else if (flag === "U") {
            await Payroll.update(
                { ...req.body },
                { where: { id: req.body.id } }
            );

            return res.status(200).json({
                success: true,
                message: "Payroll Update Successfully",
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

export const deletePayroll = async (req, res) => {
    const { Payroll } = req.db.models;
    const { sequelize } = req.db;

    try {
        const { id } = req.params;
        const result = await Payroll.destroy({
            where: { id },
        });

        if (result === 0) {
            return res.status(404).json({
                success: false,
                message: "Payroll record not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Payroll deleted successfully",
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
