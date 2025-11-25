import express from "express";
import { getPayroll, createPayroll, deletePayroll } from "../controller/payroller.controller.js";
import { generatePayroll } from "../controller/genratepayroll.controller.js";

const router = express.Router();

router.get("/getpayroll", getPayroll);
router.post("/addandupdatepayroll", createPayroll);
router.delete("/deletepayroll/:id", deletePayroll);

router.post("/genratepayroll", generatePayroll)

export default router;
