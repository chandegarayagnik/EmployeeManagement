import { Sequelize } from "sequelize";
import "dotenv/config";

export const createSequelize = (CustId) => {
    const dbName = CustId || process.env.MASTER_DB_NAME || "empMange";
    const isTrusted = process.env.TRUSTED_CONNECTION === "true" || process.env.DB_TRUSTED === "true";

    const options = {
        host: process.env.DB_SERVER || "localhost",
        dialect: "mssql",
        dialectOptions: {
            options: {
                encrypt: true,
                trustServerCertificate: true,
                trustedConnection: isTrusted,
            },
        },
        logging: false,
    };

    if (isTrusted) {
        return new Sequelize(dbName, null, null, options);
    }

    return new Sequelize(
        dbName,
        process.env.DB_USER || "SA",
        process.env.DB_PASSWORD || "",
        options
    );
};

export const sequelize = createSequelize();

export const dbConnection = async (CustId) => {
    if (CustId) {
        return createSequelize(CustId);
    }
    return sequelize;
};

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ Database connected successfully...");
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
    }
};

export default sequelize;