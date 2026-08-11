import jwt from "jsonwebtoken";
import crypto from "crypto";
import { dbConnection } from "../config/db.js";
import { loadModels } from "../model/index.js";
import "dotenv/config";

const generateCustid = (length = 6) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const generateUUID = () => {
    return crypto.randomUUID();
};

export const signup = async (req, res) => {
    let sequelize = req.db?.sequelize;
    let masterOpenedLocally = false;
    let newDbConnection = null;

    if (!sequelize) {
        sequelize = await dbConnection();
        masterOpenedLocally = true;
    }

    try {
        const {
            ClientUkeyId = generateUUID(),
            Clientname,
            BusinessName,
            Password,
            Mobile1,
            Email,
            DBPassword = "",
            DBusername = "",
            IsActive = true,
            businesstype = "General",
            Flag = "A",
            Username,
            ServerName = "localhost",
            ModuleType = "EmployeeManagement",
        } = req.body;

        const IPAddress = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Not Found";
        const CustId = req.body.CustId || generateCustid();

        // 1. Create database dynamically if it does not exist
        try {
            await sequelize.query(`IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'${CustId}') CREATE DATABASE [${CustId}];`);
        } catch (dbErr) {
            console.error("Database creation note/error:", dbErr.message);
        }

        // 2. Connect to the new tenant database
        newDbConnection = await dbConnection(CustId);
        const newModels = loadModels(newDbConnection);

        // Sync models to initialize tables in the new tenant database
        await newDbConnection.sync({ force: false });

        // 3. Create default admin user in CHILD database
        const { User: ChildUser } = newModels;
        const user = await ChildUser.create({
            userukid: ClientUkeyId,
            username: Username || Clientname || "Admin",
            email: Email,
            password: Password,
            mobile: Mobile1,
        });

        // 4. Calculate Expiry Date (15 days trial)
        const ExpiryDate = new Date();
        ExpiryDate.setDate(ExpiryDate.getDate() + 15);

        const NextRenewDate = new Date();
        NextRenewDate.setDate(ExpiryDate.getDate() + 1);

        const formattedExpiryDate = ExpiryDate.toISOString().split("T")[0];
        const nextrenewdate = NextRenewDate.toISOString().split("T")[0];

        // 5. Insert registration into MASTER database Registration table
        const models = req.db?.models || loadModels(sequelize);
        const Registration = models.Registration || models.Registartion;

        if (Registration) {
            try {
                // Ensure Registration table exists in Master DB
                await Registration.sync({ force: false });

                await Registration.create({
                    ClientUkeyId,
                    Clientname: Clientname || BusinessName,
                    BusinessName: BusinessName || Clientname,
                    Password,
                    Mobile1,
                    Email,
                    CustId,
                    DBPassword,
                    DBusername,
                    IsActive,
                    businesstype,
                    Flag,
                    Username: Username || Clientname,
                    ServerName,
                    IPAddress,
                    Version: "1.0",
                    ClientAddress: req.body.ClientAddress || "",
                    ClientCity: req.body.ClientCity || "",
                    ModuleType,
                    LicenseKey: generateCustid(8),
                    ExpiryDate: formattedExpiryDate,
                    LastRenewDate: new Date(),
                    NextRenewDate: nextrenewdate,
                    LicenseStatus: "Trial",
                    MaxUsers: 5,
                    MaxCompanies: 2,
                    MaxFirms: 2,
                    MaxInvoicesPerMonth: 100,
                    CanUseMobileApp: true,
                    CanUseAPI: false,
                    PrioritySupport: "X",
                    RenewBy: BusinessName || Clientname,
                    ProductName: "Employee Management",
                    LicenseType: "Trial",
                });
            } catch (regErr) {
                console.error("Master DB Registration sync/insert note:", regErr.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: "User created & database initialized",
            CustId,
            user,
        });
    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        if (newDbConnection) {
            await newDbConnection.close();
        }
        if (sequelize && masterOpenedLocally) {
            await sequelize.close();
        }
    }
};

export const login = async (req, res) => {
    let sequelize = req.db?.sequelize;
    let masterOpenedLocally = false;
    let targetConn = null;

    if (!sequelize) {
        sequelize = await dbConnection();
        masterOpenedLocally = true;
    }

    try {
        const { email, username, password, CustId } = req.body;
        let targetCustId = CustId;

        // If CustId not provided, search in Master DB Registration table by Email/Username
        if (!targetCustId && (email || username)) {
            const searchVal = email || username;
            try {
                const [regResult] = await sequelize.query(
                    "SELECT TOP 1 CustId FROM Registration WITH (NOLOCK) WHERE Email = :searchVal OR Username = :searchVal OR CustId = :searchVal",
                    { replacements: { searchVal } }
                );
                if (regResult && regResult[0]) {
                    targetCustId = regResult[0].CustId;
                }
            } catch (err) {
                console.error("Master DB lookup note:", err.message);
            }
        }

        targetConn = targetCustId ? await dbConnection(targetCustId) : sequelize;
        const targetModels = loadModels(targetConn);
        const { User: TargetUser } = targetModels;

        const user = await TargetUser.findOne({
            where: email ? { email } : { username },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (!password || user.password !== password) {
            return res.status(401).json({ success: false, message: "Invalid password" });
        }

        const token = jwt.sign(
            {
                id: user.id,
                userukid: user.userukid,
                email: user.email,
                CustId: targetCustId || user.CustId || null,
                LoginTime: new Date().toISOString(),
            },
            process.env.JWT_SECRET || "default_secret",
            { expiresIn: "2h" }
        );

        return res.status(200).json({
            success: true,
            message: "Login success",
            token,
            CustId: targetCustId,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    } finally {
        if (targetConn && targetConn !== sequelize) {
            await targetConn.close();
        }
        if (sequelize && masterOpenedLocally) {
            await sequelize.close();
        }
    }
};

export const logout = async (req, res) => {
    let sequelize = req.db?.sequelize;
    try {
        const models = req.db?.models || {};
        const { User } = models;
        if (User && req.user?.userukid) {
            await User.update(
                { LogoutTime: new Date() },
                { where: { userukid: req.user.userukid } }
            );
        }

        return res.status(200).json({
            success: true,
            message: "Logged out successfully",
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

export const Logout = logout;

export const listRegistration = async (req, res) => {
    let sequelize = req.db?.sequelize;
    if (!sequelize) {
        sequelize = await dbConnection();
    }

    try {
        const models = req.db?.models || loadModels(sequelize);
        const Registration = models.Registration || models.Registartion;

        if (Registration) {
            await Registration.sync({ force: false });
        }

        const { CustId, Email, page, pageSize } = req.query;

        let query = "SELECT * FROM Registration WITH (NOLOCK) WHERE 1=1";
        let countQuery = "SELECT COUNT(*) AS total FROM Registration WITH (NOLOCK) WHERE 1=1";
        const replacements = {};

        if (CustId) {
            const condition = " AND CustId = :CustId";
            query += condition;
            countQuery += condition;
            replacements.CustId = CustId;
        }

        if (Email) {
            const condition = " AND Email = :Email";
            query += condition;
            countQuery += condition;
            replacements.Email = Email;
        }

        query += " ORDER BY ClientId DESC";

        const [countResult] = await sequelize.query(countQuery, { replacements });
        const totalCount = countResult[0]?.total || 0;

        const pageNum = parseInt(page, 10);
        const pageSizeNum = parseInt(pageSize, 10);

        if (!isNaN(pageNum) && !isNaN(pageSizeNum) && pageNum > 0 && pageSizeNum > 0) {
            const offset = (pageNum - 1) * pageSizeNum;
            query += " OFFSET :offset ROWS FETCH NEXT :limit ROWS ONLY";
            replacements.offset = offset;
            replacements.limit = pageSizeNum;
        }

        const [results] = await sequelize.query(query, { replacements });

        return res.status(200).json({
            data: results,
            total: totalCount,
            page: pageNum || null,
            limit: pageSizeNum || null,
            success: true,
        });
    } catch (error) {
        console.error("REGISTRATION LISTING ERROR:", error);
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
