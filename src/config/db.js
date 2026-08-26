import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const dbConnection = async (DB_NAME = env.DB_NAME, DB_USER = env.DB_USER, DB_PASSWORD = env.DB_PASSWORD, DB_SERVER = env.DB_SERVER) => {

    try {
        const masterConnection = new Sequelize(
            DB_NAME,
            DB_USER,
            DB_PASSWORD,
            {
                host: DB_SERVER,
                dialect: "mssql",
                dialectOptions: {
                    options: {
                        encrypt: true,
                        trustServerCertificate: true,
                    },
                },
                logging: env.ENVIROMENT == 'DEVELOPMENT' ? true : false,
            }
        );

        try {
            await masterConnection.authenticate();
            console.log(`✅ Database connected successfully...`);
        } catch (err) {
            console.error("❌ Database connection failed:", err.message);
        }

        return masterConnection;
    } catch (err) {
        console.log(err);
    }
};
