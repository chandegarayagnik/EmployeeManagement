import express from "express";
import { generateSalarySlip } from "../controller/salarySlip.controller.js";

const router = express.Router();

router.get("/salary-slip/:payrollId", generateSalarySlip);

export default router;
