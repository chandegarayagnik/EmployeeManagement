import express from "express";
import { generateSalarySlip } from "../controller/salarySlip.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/salary-slip/:payrollId", generateSalarySlip);

export default router;
