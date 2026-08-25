import "dotenv/config";
import bcrypt from "bcrypt";

export const signup = async (req, res) => {
    const { Registration } = req.db.models;
    try {
        const {
            ClientUkeyId,
            CustId,
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
            IPAddress,
            Device,
            ReferenceBy
        } = req.body;

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

        console.log("existingUsername", existingUsername);

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
            IPAddress: IPAddress || req.ip,
            Device: Device || null,
            ReferenceBy: ReferenceBy?.trim() || null
        });

        // 7. Remove password from response
        const responseData = registration.toJSON();
        delete responseData.Password;

        // 8. Response
        return res.status(201).json({
            status: true,
            message: "Registration successful",
            data: responseData
        });

    } catch (error) {
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
                message: "Username and Password are required"
            });
        }

        const user = await Registration.findOne({
            where: {
                Username: Username.trim()
            }
        });

        if (!user) {
            return res.status(401).json({
                status: false,
                message: "Invalid username or password"
            });
        }

        if (!user.IsActive) {
            return res.status(403).json({
                status: false,
                message: "Your account is inactive"
            });
        }

        const passwordMatch = await bcrypt.compare(
            Password,
            user.Password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                status: false,
                message: "Invalid username or password"
            });
        }

        const role = user.Role?.trim();

        if (!["Admin", "User"].includes(role)) {
            return res.status(403).json({
                status: false,
                message: "Invalid user role"
            });
        }

        const tokenPayload = {
            Id: user.Id,
            ClientUkeyId: user.ClientUkeyId,
            CustId: user.CustId,
            Username: user.Username,
            Role: role
        };

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            {
                expiresIn: "30d"
            }
        );

        return res.status(200).json({
            status: true,
            message: `${role} login successful`,
            token,
            data: {
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
                LicenseDate: user.LicenseDate
            }
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
