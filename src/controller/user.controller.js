import jwt from "jsonwebtoken";
import { dbConnection } from "../config/db.js";
import "dotenv/config";

export const createregister = async (req, res) => {
    try {
        const { userukid, username, email, password, mobile } = req.body;
        const sequelize = await dbConnection()

        await sequelize.query(
            `INSERT INTO users(userukid, username, email, password, Mobile ) VALUES(:userukid, :username, :email, :password, :mobile);`,
            {
                replacements: {
                    userukid, username, email, password, mobile
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
            {
                id: user[0].id,
                email: user[0].email
            },
            process.env.JWT_SECRET,
            { expiresIn: "2h" }
        );

        res.json({ message: "Login success", token, Success: true });
    } catch (err) {
        res.status(500).json({ error: err.message, Success: false });
    }
}

export const forgetPassword = async (req, res) => {
    const { password, mobile } = req.body

    const sequelize = await dbConnection()

    try {

        if (!password || !mobile) {
            return res.status(400).json({ error: "Password And Moblie Is Required", Success: false })
        }

        const result = await sequelize.query(`update users set password = :password where mobile = :moblie;`,
            {
                replacements: { password, mobile },
            }
        )   

        console.log("Result => ", result);

        res.status(200).json({ message: "Password Update SuccessFully" })

    } catch (error) {
        res.status(500).json({ message: "Database Error " })
        console.log(error);
    }
}
