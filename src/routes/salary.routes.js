import express from "express";
import { getSalary, listSalaryById, createSalary, deleteSalary } from "../controller/salary.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/getsalary", getSalary);
router.get("/getbyid/:id", listSalaryById);
router.post("/addandupdatesalary", createSalary);
router.delete("/deletesalary/:id", deleteSalary);

export default router;
