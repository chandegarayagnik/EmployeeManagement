import express from "express";
import { listPayroll, listPayrollById, generatePayroll, deletePayroll } from "../controller/payroller.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { attachDatabase } from "../middleware/db.middleware.js";

const router = express.Router();

router.get("/getpayroll", authenticateJWT, attachDatabase, listPayroll);
router.get("/getbyid/:id", authenticateJWT, attachDatabase, listPayrollById);
router.post("/genratepayroll", authenticateJWT, attachDatabase, generatePayroll);
router.delete("/deletepayroll/:id", authenticateJWT, attachDatabase, deletePayroll);

export default router;
