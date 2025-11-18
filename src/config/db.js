import sql from "mssql"
import "dotenv/config"

export const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options : {
        trustServerCertificate: true
    }
}

export async function ConnectDB() {
    try {
        await sql.connect(config);
        console.log("✅ Connected to MSSQL Database");
    } catch (err) {
        console.error("Database connection failed:", err);
    }
}

ConnectDB()

export default sql