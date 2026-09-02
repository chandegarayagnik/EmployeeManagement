import fs from "fs";
import path from "path";

/**
 * Helper function to remove attendance photo from media directory
 */
const removeAttendancePhoto = (photoFileName) => {
    if (!photoFileName) return;
    const filePath = path.resolve("./media", photoFileName);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
        } catch (err) {
            console.error("Error deleting attendance image file:", err);
        }
    }
};

/**
 * Get Attendance listing with dynamic filters, pagination & photo references
 */
export const getAttendance = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { empukid, EmpId, date, AttendenceDate, status, page, pageSize } = req.query;

        // 1. INITIALIZE QUERIES
        let query = `
            SELECT a.*, e.name, e.email, e.position, e.salary 
            FROM attendance a WITH (NOLOCK)
            LEFT JOIN emp e WITH (NOLOCK) ON (a.empukid = e.empukid OR a.EmpId = e.Id OR a.EmpId = e.EmployeeId)
            WHERE 1=1
        `;
        let countQuery = `
            SELECT COUNT(*) AS total 
            FROM attendance a WITH (NOLOCK)
            LEFT JOIN emp e WITH (NOLOCK) ON (a.empukid = e.empukid OR a.EmpId = e.Id OR a.EmpId = e.EmployeeId)
            WHERE 1=1
        `;
        const replacements = {};

        // 2. DYNAMIC FILTER MAPPING
        const targetEmpId = empukid || EmpId;
        if (targetEmpId) {
            const condition = " AND (a.empukid = :targetEmpId OR a.EmpId = :targetEmpId)";
            query += condition;
            countQuery += condition;
            replacements.targetEmpId = targetEmpId;
        }

        const targetDate = date || AttendenceDate;
        if (targetDate) {
            const condition = " AND (a.date = :targetDate OR a.AttendenceDate = :targetDate)";
            query += condition;
            countQuery += condition;
            replacements.targetDate = targetDate;
        }

        if (status) {
            const condition = " AND a.status = :status";
            query += condition;
            countQuery += condition;
            replacements.status = status;
        }

        // 3. ORDER BY
        query += " ORDER BY COALESCE(a.AttendenceDate, a.date) DESC, COALESCE(a.InTime, a.check_in) ASC";

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

        // Map media URL for images if present
        const mappedResults = results.map((item) => {
            const imageName = item.Img || item.AttendanceImage || item.image || item.photo || null;
            return {
                ...item,
                imageUrl: imageName ? `/media/${imageName}` : null,
            };
        });

        // 7. FINAL RESPONSE
        return res.status(200).json({
            data: mappedResults,
            total: totalCount,
            page: pageNum || null,
            limit: pageSizeNum || null,
            success: true,
        });
    } catch (error) {
        console.error("ATTENDANCE LISTING ERROR:", error);
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
 * Get single Attendance record by ID
 */
export const listAttendanceById = async (req, res) => {
    const { sequelize } = req.db;
    try {
        const { id } = req.params;
        const [result] = await sequelize.query(
            `SELECT a.*, e.name, e.email, e.position 
             FROM attendance a WITH (NOLOCK)
             LEFT JOIN emp e WITH (NOLOCK) ON (a.empukid = e.empukid OR a.EmpId = e.Id OR a.EmpId = e.EmployeeId)
             WHERE a.AttendenceID = :id OR a.id = :id`,
            { replacements: { id } }
        );

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found",
            });
        }

        const record = result[0];
        const imageName = record.Img || record.AttendanceImage || record.image || record.photo || null;

        return res.status(200).json({
            success: true,
            data: {
                ...record,
                imageUrl: imageName ? `/media/${imageName}` : null,
            },
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
 * Create or Update Attendance record with Image support
 */
export const createAttendance = async (req, res) => {
    const { Attendance } = req.db.models;
    const { sequelize } = req.db;

    try {
        const flag = req.body.Flag || req.body.flag || "A";

        // Extract uploaded image filename from multer
        const uploadedImage =
            req.files?.AttendanceImage?.[0]?.filename ||
            req.files?.Img?.[0]?.filename ||
            req.files?.image?.[0]?.filename ||
            req.files?.photo?.[0]?.filename ||
            req.file?.filename ||
            null;

        const IPAddress = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.body.IPAddress || null;

        if (flag === "A") {
            const newRecord = await Attendance.create({
                ...req.body,
                Img: uploadedImage || req.body.Img || req.body.AttendanceImage || null,
                AttendanceImage: uploadedImage || req.body.AttendanceImage || req.body.Img || null,
                IPAddress: IPAddress,
            });

            return res.status(201).json({
                success: true,
                message: "Attendance Created Successfully",
                data: newRecord,
            });
        } else if (flag === "U") {
            const attendanceId = req.body.AttendenceID || req.body.id;

            if (!attendanceId) {
                return res.status(400).json({
                    success: false,
                    message: "Attendance ID (AttendenceID or id) is required for update",
                });
            }

            // Find existing record to preserve or update image file
            let existingRecord = await Attendance.findByPk(attendanceId).catch(() => null);
            if (!existingRecord) {
                existingRecord = await Attendance.findOne({
                    where: { AttendenceID: attendanceId },
                }).catch(() => null);
            }

            let imagePath = existingRecord?.Img || existingRecord?.AttendanceImage || null;

            if (uploadedImage) {
                if (existingRecord?.Img) {
                    removeAttendancePhoto(existingRecord.Img);
                }
                if (existingRecord?.AttendanceImage && existingRecord.AttendanceImage !== existingRecord.Img) {
                    removeAttendancePhoto(existingRecord.AttendanceImage);
                }
                imagePath = uploadedImage;
            }

            const updatePayload = {
                ...req.body,
                Img: imagePath,
                AttendanceImage: imagePath,
                IPAddress: IPAddress,
            };

            if (existingRecord) {
                await existingRecord.update(updatePayload);
            } else {
                await Attendance.update(updatePayload, {
                    where: { AttendenceID: attendanceId },
                });
            }

            return res.status(200).json({
                success: true,
                message: "Attendance Updated Successfully",
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid Flag value. Use 'A' for Add and 'U' for Update.",
            });
        }
    } catch (error) {
        console.error("CREATE/UPDATE ATTENDANCE ERROR:", error);
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
 * Delete Attendance record and remove associated photo file
 */
export const deleteAttendance = async (req, res) => {
    const { Attendance } = req.db.models;
    const { sequelize } = req.db;

    try {
        const { id } = req.params;

        let record = await Attendance.findByPk(id).catch(() => null);
        if (!record) {
            record = await Attendance.findOne({
                where: { AttendenceID: id },
            }).catch(() => null);
        }

        if (!record) {
            return res.status(404).json({
                success: false,
                message: "Attendance record not found",
            });
        }

        // Remove associated photo file if present
        if (record.Img) {
            removeAttendancePhoto(record.Img);
        }
        if (record.AttendanceImage && record.AttendanceImage !== record.Img) {
            removeAttendancePhoto(record.AttendanceImage);
        }

        await record.destroy();

        return res.status(200).json({
            success: true,
            message: "Attendance deleted successfully",
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
