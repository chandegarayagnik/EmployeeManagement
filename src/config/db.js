import { Sequelize } from "sequelize";
import "dotenv/config"

export const dbConnection = async () => {
    try {
        let masterConnection = new Sequelize(
            process.env.MASTER_DB_NAME,
            process.env.DB_USER,
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_SERVER,
                dialect: "mssql",
                dialectOptions: {
                    options: {
                        encrypt: true,
                        trustServerCertificate: true,
                        trustedConnection: true,
                    },
                },
                logging: false,
            }
        );        

        await masterConnection.authenticate();
        console.log("✅ Database connected successfully...");
        return masterConnection;
    } catch (err) {
        console.error("Database connection failed:", err);
        throw err
    }
}

dbConnection()  