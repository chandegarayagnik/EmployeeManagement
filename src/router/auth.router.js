import { Router } from "express";
import sql from "../config/db.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const router = Router()

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  console.log("req body", req.body);

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await sql.query`INSERT INTO Users (Username, Email, PasswordHash) VALUES (${username}, ${email}, ${passwordHash})`;
    console.log(result);
    res.json({ message: "User registered successfully", result});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body
    try {
        const result = await sql.query`SELECT * FROM Users WHERE Email = ${email}`;
        const user = result.recordset[0];

        if (!user) return res.status(400).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ error: "Invalid password" });

        const token = jwt.sign({ id: user.UserID }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({ token, user: { id: user.UserID, username: user.Username, email: user.Email } });
    } catch (error) {
        res.status(500).json(({ message: error.message }))
    }
})

export const authrouter = router