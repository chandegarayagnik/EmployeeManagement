import express from "express";
import { generatePayroll } from "../controller/payroller.controller.js";

const router = express.Router();

// router.get("/getpayroll", getPayroll);
// router.post("/addandupdatepayroll", createPayroll);
// router.delete("/deletepayroll/:id", deletePayroll);

router.post("/genratepayroll", generatePayroll)

export default router;
