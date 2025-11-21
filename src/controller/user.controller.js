import jwt from "jsonwebtoken";
import { dbConnection } from "../config/db.js";
import "dotenv/config";

export const createregister = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const sequelize = await dbConnection()
        
        await sequelize.query(
            `INSERT INTO users (username, email, password) VALUES (:username, :email, :password)`,
            {
                replacements: {
                    username, email, password
                }
            }
        );

        res.json({ message: "User registered successfully!", Success: true });
    } catch (err) {
        res.status(500).json({ error: err.message, Success: false });
        console.log(err);
    }
}

export const createlogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const sequelize = await dbConnection()
        // Get user with raw query
        const [user] = await sequelize.query(
            `SELECT top 1 * FROM users WHERE email = :email`,
            { replacements: { email } }
        );

        if (!user[0]) return res.status(404).json({ error: "User not found" });

        if (!password) return res.status(401).json({ error: "Invalid password" });

        const token = jwt.sign(
            { id: user[0].id,
              email: user[0].email },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Login success", token, Success : true });
    } catch (err) {
        res.status(500).json({ error: err.message, Success : false });
    }
}