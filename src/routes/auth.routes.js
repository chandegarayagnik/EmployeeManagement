import { Router } from "express";
import { signup, login, Logout, listRegistration } from "../controller/auth.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { attachDatabase } from "../middleware/db.middleware.js";

const router = Router();

router.post("/signup", attachDatabase, signup);
router.post("/login", attachDatabase, login);
router.post("/logout", authenticateJWT, attachDatabase, Logout);
router.get("/registrations", authenticateJWT, attachDatabase, listRegistration);

export default router;
