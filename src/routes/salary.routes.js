import express from "express";
import { getSalary, listSalaryById, createSalary, deleteSalary } from "../controller/salary.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { attachDatabase } from "../middleware/db.middleware.js";

const router = express.Router();

router.get("/getsalary", authenticateJWT, attachDatabase, getSalary);
router.get("/getbyid/:id", authenticateJWT, attachDatabase, listSalaryById);
router.post("/addandupdatesalary", authenticateJWT, attachDatabase, createSalary);
router.delete("/deletesalary/:id", authenticateJWT, attachDatabase, deleteSalary);

export default router;
