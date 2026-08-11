import express from "express";
import { listPayroll, listPayrollById, generatePayroll, deletePayroll } from "../controller/payroller.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/getpayroll", listPayroll);
router.get("/getbyid/:id", listPayrollById);
router.post("/genratepayroll", generatePayroll);
router.delete("/deletepayroll/:id", deletePayroll);

export default router;
