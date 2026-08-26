import bcrypt from "bcrypt";
import { generateJWTT } from "../utility/jwt.js";

export const signup = async (req, res) => {
    const { Registration, Company, Employee } = req.db.models;
    const { sequelize } = req.db
    const transaction = await sequelize.transaction();

    try {
        const {
            ClientUkeyId,
            CustId,
            CompanyName,
            FirstName,
            LastName,
            Mobile,
            Email,
            Username,
            Password,
            Role,
            IsActive,
            IsDefault,
            LicenseDate,
            Address,
            Device,
            ReferenceBy
        } = req.body;

        const IPAddress = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "Not Found";

        // 1. Required field validation
        if (!ClientUkeyId) {
            return res.status(400).json({
                status: false,
                message: "ClientUkeyId is required"
            });
        }

        if (!CustId) {
            return res.status(400).json({
                status: false,
                message: "CustId is required"
            });
        }

        if (!Username) {
            return res.status(400).json({
                status: false,
                message: "Username is required"
            });
        }

        if (!Password) {
            return res.status(400).json({
                status: false,
                message: "Password is required"
            });
        }

        // 2. Check duplicate username
        const existingUsername = await Registration.findOne({
            where: {
                Username: Username.trim()
            }
        });

        if (existingUsername) {
            return res.status(409).json({
                status: false,
                message: "Username already exists"
            });
        }

        // 3. Check duplicate email
        if (Email) {
            const existingEmail = await Registration.findOne({
                where: {
                    Email: Email.trim()
                }
            });

            if (existingEmail) {
                return res.status(409).json({
                    status: false,
                    message: "Email already exists"
                });
            }
        }

        // 4. Check duplicate CustId
        const existingCustId = await Registration.findOne({
            where: {
                CustId: CustId.trim()
            }
        });

        if (existingCustId) {
            return res.status(409).json({
                status: false,
                message: "CustId already exists"
            });
        }

        // 5. Hash password
        const hashedPassword = await bcrypt.hash(Password, 10);

        // 6. Create registration
        const registration = await Registration.create({
            ClientUkeyId: ClientUkeyId.trim(),
            CustId: CustId.trim(),
            FirstName: FirstName?.trim(),
            LastName: LastName?.trim(),
            Mobile: Mobile?.trim(),
            Email: Email?.trim(),
            Username: Username.trim(),
            Password: hashedPassword,
            Role: Role?.trim() || "User",
            IsActive: IsActive ?? true,
            IsDefault: IsDefault ?? false,
            LicenseDate: LicenseDate || null,
            IPAddress: IPAddress,
            Device: Device || null,
            ReferenceBy: ReferenceBy?.trim() || null,
            remark: Password?.trim() || null,
        }, { transaction });

        const company = await Company.create({
            CompanyName: CompanyName.trim(),
            Add1: Address.trim(),
            Mobile1: Mobile.trim(),
            Email: Email.trim(),
            CustId: CustId.trim(),
            ClientUkeyId: ClientUkeyId.trim(),
            UserName: Username.trim(),
            IsActive: IsActive ?? true,
            IPAddress: IPAddress,
            Flag: "A",
        }, { transaction });

        const employee = await Employee.create({
            EmployeeId: ClientUkeyId.trim(),
            FirstName: FirstName.trim(),
            LastName: LastName.trim(),
            Add1: Address.trim(),
            Mobile1: Mobile.trim(),
            Email: Email.trim(),
            Role: Role.trim(),
            LicenseDate: LicenseDate.trim(),
            CustId: CustId.trim(),
            UserName: Username.trim(),
            Password: hashedPassword,
            IsActive: IsActive ?? true,
            IPAddress: IPAddress,
            Flag: "A",
        }, { transaction });

        // Commit transaction when all records are created successfully
        await transaction.commit();

        // 7. Remove password from response
        const responseData = registration.toJSON();
        delete responseData.Password;
        delete responseData.remark;

        // 8. Response
        return res.status(201).json({
            status: true,
            message: "Registration successful",
            data: responseData
        });

    } catch (error) {
        await transaction.rollback();

        console.error("Signup Error:", error);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

export const login = async (req, res) => {
    const { Registration } = req.db.models;
    const { Username, Password } = req.body;
    try {
        if (!Username || !Password) {
            return res.status(400).json({
                status: false,
                message: "Username and Password are Required"
            });
        }

        const user = await Registration.findOne({
            where: {
                Username: Username.trim()
            }
        });

        console.log("user", user);

        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Invalid Username or Password"
            });
        }

        if (!user.IsActive) {
            return res.status(403).json({
                status: false,
                message: "Your Account Is Inactive"
            });
        }

        const passwordMatch = await bcrypt.compare(
            Password,
            user.Password
        );

        console.log("passwordMatch", passwordMatch);

        if (!passwordMatch) {
            return res.status(401).json({
                status: false,
                message: "Invalid Username or Password"
            });
        }

        const tokenPayload = {
            Id: user.Id,
            ClientUkeyId: user.ClientUkeyId,
            CustId: user.CustId,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Mobile: user.Mobile,
            Email: user.Email,
            Username: user.Username,
            LicenseDate: user.LicenseDate,
            ReferenceBy: user.ReferenceBy,
            Role: role
        };

        const token = generateJWTT(tokenPayload);

        return res.status(200).json({
            status: true,
            message: `${role} login successful`,
            token,
            Id: user.Id,
            ClientUkeyId: user.ClientUkeyId,
            CustId: user.CustId,
            FirstName: user.FirstName,
            LastName: user.LastName,
            Mobile: user.Mobile,
            Email: user.Email,
            Username: user.Username,
            Role: role,
            IsActive: user.IsActive,
            IsDefault: user.IsDefault,
            LicenseDate: user.LicenseDate,
            ReferenceBy: user.ReferenceBy,
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            status: false,
            message: "Something went wrong",
            error: error.message
        });
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
