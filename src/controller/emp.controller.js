import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";

/**
 * Helper to remove old photo from media folder if present
 */
const removePhotoFile = (photoFileName) => {
    if (!photoFileName) return;
    const filePath = path.resolve("./media", photoFileName);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error("Error deleting image file:", err);
        }
    }
};

/**
 * Get Employee list with dynamic filtering & pagination
 */
export const getEmp = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { empukid, EmployeeId, Id, name, FirstName, LastName, email, position, salary, DepartmentID, DepartmentId, IsActive, page, pageSize } = req.query;

        // Try EmployeeMaster table first, fallback to emp if needed
        let tableName = "EmployeeMaster";
        let query = `SELECT * FROM ${tableName} WITH (NOLOCK) WHERE 1=1`;
        let countQuery = `SELECT COUNT(*) AS total FROM ${tableName} WITH (NOLOCK) WHERE 1=1`;
        const replacements = {};

        const empId = empukid || EmployeeId || Id;
        if (empId) {
            const condition = " AND (EmployeeId = :empId OR empukid = :empId OR Id = :empId)";
            query += condition;
            countQuery += condition;
            replacements.empId = empId;
        }

        const empName = name || FirstName || LastName;
        if (empName) {
            const condition = " AND (FirstName LIKE :empName OR LastName LIKE :empName OR (FirstName + ' ' + LastName) LIKE :empName)";
            query += condition;
            countQuery += condition;
            replacements.empName = `%${empName}%`;
        }

        if (email) {
            const condition = " AND Email LIKE :email";
            query += condition;
            countQuery += condition;
            replacements.email = `%${email}%`;
        }

        if (position) {
            const condition = " AND (PositionId = :position OR Role LIKE :positionStr)";
            query += condition;
            countQuery += condition;
            replacements.position = isNaN(Number(position)) ? null : Number(position);
            replacements.positionStr = `%${position}%`;
        }

        if (salary) {
            const condition = " AND SalaryAmount = :salary";
            query += condition;
            countQuery += condition;
            replacements.salary = salary;
        }

        const deptId = DepartmentID || DepartmentId;
        if (deptId) {
            const condition = " AND DepartmentId = :deptId";
            query += condition;
            countQuery += condition;
            replacements.deptId = deptId;
        }

        if (IsActive !== undefined && IsActive !== null && IsActive !== "") {
            const condition = " AND IsActive = :IsActive";
            query += condition;
            countQuery += condition;
            replacements.IsActive = IsActive === "true" || IsActive === true || IsActive === "1" ? 1 : 0;
        }

        query += " ORDER BY Id DESC";

        let results, totalCount;
        try {
            const [countResult] = await sequelize.query(countQuery, { replacements });
            totalCount = countResult[0]?.total || 0;

            const pageNum = parseInt(page, 10);
            const pageSizeNum = parseInt(pageSize, 10);

            if (!isNaN(pageNum) && !isNaN(pageSizeNum) && pageNum > 0 && pageSizeNum > 0) {
                const offset = (pageNum - 1) * pageSizeNum;
                query += " OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
                replacements.offset = offset;
                replacements.limit = pageSizeNum;
            }

            [results] = await sequelize.query(query, { replacements });
        } catch (err) {
            // Fallback query for legacy 'emp' table if 'EmployeeMaster' table fails
            tableName = "emp";
            let fallbackQuery = `SELECT * FROM ${tableName} WITH (NOLOCK) WHERE 1=1`;
            let fallbackCountQuery = `SELECT COUNT(*) AS total FROM ${tableName} WITH (NOLOCK) WHERE 1=1`;

            const [countResult] = await sequelize.query(fallbackCountQuery, { replacements });
            totalCount = countResult[0]?.total || 0;

            const pageNum = parseInt(page, 10);
            const pageSizeNum = parseInt(pageSize, 10);

            if (!isNaN(pageNum) && !isNaN(pageSizeNum) && pageNum > 0 && pageSizeNum > 0) {
                const offset = (pageNum - 1) * pageSizeNum;
                fallbackQuery += " OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
                replacements.offset = offset;
                replacements.limit = pageSizeNum;
            }

            [results] = await sequelize.query(fallbackQuery, { replacements });
        }

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        return res.status(200).json({
            success: true,
            data: results,
            total: totalCount,
            page: !isNaN(pageNum) ? pageNum : null,
            limit: !isNaN(pageSizeNum) ? pageSizeNum : null,
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

/**
 * Get single Employee details by ID or EmployeeId
 */
export const listEmpById = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { Id } = req.params;
        let [result] = await sequelize.query(
            "SELECT * FROM EmployeeMaster WITH (NOLOCK) WHERE Id = :Id",
            { replacements: { Id } }
        )

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
    try {
        const { sequelize } = req.db;
        const { Employee } = req.db.models
        const { Flag, Password, Id, CustId } = req.body;
        const IPAddress = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Not Found";

        if (Flag === "A") {

            const hashedPassword = await bcrypt.hash(
                Password,
                10
            );

            let imagePath = null;

            if (req.files?.Img) {
                imagePath = req.files.Img[0]?.filename;
            }

            const employee = await Employee.create({
                ...req.body,
                Img: imagePath,
                Password: hashedPassword,
                IPAddress: IPAddress,
            });
        }

        else if (Flag === "U") {

            if (!Id) {
                return res.status(400).json({
                    status: false,
                    message: "Id is required for update"
                });
            }
            const employee = await Employee.findOne({
                where: {
                    Id: Id,
                    CustId: CustId.trim()
                }
            });

            if (!employee) {
                return res.status(404).json({
                    status: false,
                    message: "Employee not found"
                });
            }

            let imagePath = employee.Img;
            const newImage = req.files?.Img?.[0]?.filename || req.files?.empphoto?.[0]?.filename || req.file?.filename;

            if (newImage) {
                if (employee.Img) {
                    removePhotoFile(employee.Img);
                }
                imagePath = newImage;
            }

            let password = employee.Password;

            if (Password && Password.trim() !== "" && Password.trim() !== "••••••••") {
                password = await bcrypt.hash(
                    Password,
                    10
                );
            }

            await employee.update({
                ...req.body,
                Img: imagePath,
                Password: password,
                IPAddress: IPAddress
            });
        }

        return res.status(201).json({
            status: true,
            message: Flag === "A" ? "Employee Created Successfully" : "Employee Updated Successfully",
        });

    } catch (error) {

        console.error(
            "Manage Employee Error:",
            error
        );

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

/**
 * Get / Download Employee Photo
 */
export const getEmpPhoto = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { Id } = req.params;
        let [result] = await sequelize.query(
            "SELECT Img FROM EmployeeMaster WITH (NOLOCK) WHERE Id = :Id", {
            replacements: { Id },
            type: sequelize.QueryTypes.SELECT
        });

        const photoName = result?.Img;

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Employee Photo Not Found",
            });
        }

        const filePath = path.resolve("./media", photoName);
        console.log("File Path : ", filePath);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "Image file does not exist on server",
            });
        }

        return res.status(200).download(filePath);

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

/**
 * Delete Employee and cleanup uploaded image
 */
export const deleteEmp = async (req, res) => {
    const { Employee } = req.db.models;
    const { sequelize } = req.db;
    try {
        const { Id } = req.params;

        if (!Id) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }

        const empRecord = await Employee.findOne({
            where: {
                Id: Id,
            },
        });

        if (!empRecord) {
            return res.status(404).json({
                success: false,
                message: "Employee Not Found",
            });
        }

        // Delete photo file if present
        const photoName = empRecord?.Img;
        console.log("Photo Name in Delete: ", photoName);
        console.log("Emp Record in Delete: ", empRecord);

        if (photoName) {
            removePhotoFile(photoName);
        }

        await Employee.destroy({
            where: {
                Id: Id,
            },
        });

        return res.status(200).json({
            success: true,
            message: "Employee Deleted Successfully",
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

