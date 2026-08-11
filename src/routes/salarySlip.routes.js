import express from "express";
import { generateSalarySlip } from "../controller/salarySlip.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { attachDatabase } from "../middleware/db.middleware.js";

const router = express.Router();

router.get("/salary-slip/:payrollId", authenticateJWT, attachDatabase, generateSalarySlip);

export default router;
