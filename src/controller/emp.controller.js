import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { Op } from "sequelize";

/**
 * Helper to extract photo filename from Multer req.files, req.file, or req.body
 */
const getUploadedPhotoName = (req) => {
    if (req.file?.filename) {
        return req.file.filename;
    }
    if (req.files) {
        if (req.files.Img?.[0]?.filename) return req.files.Img[0].filename;
        if (req.files.empphoto?.[0]?.filename) return req.files.empphoto[0].filename;
        if (req.files.image?.[0]?.filename) return req.files.image[0].filename;
        if (req.files.photo?.[0]?.filename) return req.files.photo[0].filename;
    }
    if (req.body?.Img && typeof req.body.Img === "string") return req.body.Img;
    if (req.body?.empphoto && typeof req.body.empphoto === "string") return req.body.empphoto;
    return null;
};

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
        const { empukid } = req.params;
        let [result] = await sequelize.query(
            "SELECT * FROM EmployeeMaster WITH (NOLOCK) WHERE EmployeeId = :empukid OR Id = :empukid OR empukid = :empukid",
            { replacements: { empukid } }
        ).catch(async () => {
            return await sequelize.query(
                "SELECT * FROM emp WITH (NOLOCK) WHERE empukid = :empukid OR id = :empukid",
                { replacements: { empukid } }
            );
        });

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

/**
 * Helper to parse boolean values safely from string or boolean
 */
const parseBoolean = (val, defaultVal) => {
    if (val === undefined || val === null || val === "") return defaultVal;
    if (typeof val === "boolean") return val;
    const str = String(val).trim().toLowerCase();
    if (str === "true" || str === "1") return true;
    if (str === "false" || str === "0") return false;
    return defaultVal;
};

/**
 * Create or Update Employee with image upload support via Multer
 */
export const createEmp = async (req, res) => {
    const { Employee } = req.db.models;
    const { sequelize } = req.db;
    try {
        const rawFlag = req.body.Flag ?? req.body.flag ?? "A";
        let flag = String(rawFlag).trim().toUpperCase();
        if (flag === "ADD" || flag === "CREATE") flag = "A";
        if (flag === "UPDATE" || flag === "EDIT") flag = "U";

        const photoFileName = getUploadedPhotoName(req);
        const empIdentifier = req.body.Id || req.body.EmployeeId || req.body.empukid;

        // Hash password if provided in plaintext
        let hashedPassword = req.body.Password;
        if (req.body.Password && !String(req.body.Password).startsWith("$2a$") && !String(req.body.Password).startsWith("$2b$")) {
            hashedPassword = await bcrypt.hash(String(req.body.Password), 10);
        }

        if (flag === "A") {
            const employeeData = {
                ...req.body,
                Img: photoFileName || (typeof req.body.Img === "string" && req.body.Img.trim() ? req.body.Img.trim() : null) || (typeof req.body.empphoto === "string" && req.body.empphoto.trim() ? req.body.empphoto.trim() : null) || null,
                empphoto: photoFileName || (typeof req.body.empphoto === "string" && req.body.empphoto.trim() ? req.body.empphoto.trim() : null) || (typeof req.body.Img === "string" && req.body.Img.trim() ? req.body.Img.trim() : null) || null,
                Flag: "A",
            };

            if (req.body.IsActive !== undefined) employeeData.IsActive = parseBoolean(req.body.IsActive, true);
            if (req.body.IsLogin !== undefined) employeeData.IsLogin = parseBoolean(req.body.IsLogin, false);
            if (req.body.IsFetchLocation !== undefined) employeeData.IsFetchLocation = parseBoolean(req.body.IsFetchLocation, false);
            if (hashedPassword) employeeData.Password = hashedPassword;

            const createdEmployee = await Employee.create(employeeData);

            return res.status(200).json({
                success: true,
                message: "Employee Created Successfully",
                data: createdEmployee,
            });
        } else if (flag === "U") {
            if (!empIdentifier) {
                return res.status(400).json({
                    success: false,
                    message: "Employee ID (Id, EmployeeId, or empukid) is required for update",
                });
            }

            // Find existing record to manage photo cleanup
            const oldRecord = await Employee.findOne({
                where: {
                    [Op.or]: [
                        { Id: empIdentifier },
                        { EmployeeId: String(empIdentifier) },
                        { empukid: String(empIdentifier) },
                    ],
                },
            }).catch(() => null);

            const oldPhoto = oldRecord?.Img || oldRecord?.empphoto || null;
            const updatedPhoto = photoFileName || oldPhoto;

            // If a new photo is uploaded, delete the old photo file
            if (photoFileName && oldPhoto && oldPhoto !== photoFileName) {
                removePhotoFile(oldPhoto);
            }

            const updateData = {
                ...req.body,
                Img: updatedPhoto,
                empphoto: updatedPhoto,
                Flag: "U",
            };

            if (req.body.IsActive !== undefined) updateData.IsActive = parseBoolean(req.body.IsActive, true);
            if (req.body.IsLogin !== undefined) updateData.IsLogin = parseBoolean(req.body.IsLogin, false);
            if (req.body.IsFetchLocation !== undefined) updateData.IsFetchLocation = parseBoolean(req.body.IsFetchLocation, false);
            if (hashedPassword) updateData.Password = hashedPassword;

            await Employee.update(updateData, {
                where: {
                    [Op.or]: [
                        { Id: empIdentifier },
                        { EmployeeId: String(empIdentifier) },
                        { empukid: String(empIdentifier) },
                    ],
                },
            });

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
        console.error("CREATE/UPDATE EMPLOYEE ERROR:", error);
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
 * Update Employee explicit wrapper
 */
export const updateEmp = async (req, res) => {
    req.body.Flag = "U";
    req.body.flag = "U";
    return createEmp(req, res);
};

/**
 * Get / Download Employee Photo
 */
export const getEmpPhoto = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { empukid } = req.params;
        let [result] = await sequelize.query(
            "SELECT Img, empphoto FROM EmployeeMaster WITH (NOLOCK) WHERE EmployeeId = :empukid OR Id = :empukid OR empukid = :empukid",
            { replacements: { empukid } }
        ).catch(async () => {
            return await sequelize.query(
                "SELECT empphoto, Img FROM emp WITH (NOLOCK) WHERE empukid = :empukid OR id = :empukid",
                { replacements: { empukid } }
            );
        });

        const photoName = result?.[0]?.Img || result?.[0]?.empphoto;

        if (!result || !result[0] || !photoName) {
            return res.status(404).json({
                success: false,
                message: "Employee Photo Not Found",
            });
        }

        const filePath = path.resolve("./media", photoName);
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: "Image file does not exist on server",
            });
        }

        return res.download(filePath);
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
        const empIdentifier = req.params.empukid || req.body.empukid || req.body.Id || req.body.EmployeeId;

        if (!empIdentifier) {
            return res.status(400).json({
                success: false,
                message: "Employee ID is required",
            });
        }

        const empRecord = await Employee.findOne({
            where: {
                [Op.or]: [
                    { Id: empIdentifier },
                    { EmployeeId: String(empIdentifier) },
                    { empukid: String(empIdentifier) },
                ],
            },
        }).catch(() => null);

        if (!empRecord) {
            return res.status(404).json({
                success: false,
                message: "Employee not found",
            });
        }

        // Delete photo file if present
        const photoName = empRecord.Img || empRecord.empphoto;
        if (photoName) {
            removePhotoFile(photoName);
        }

        await Employee.destroy({
            where: {
                [Op.or]: [
                    { Id: empIdentifier },
                    { EmployeeId: String(empIdentifier) },
                    { empukid: String(empIdentifier) },
                ],
            },
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

