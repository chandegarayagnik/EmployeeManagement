import express from "express";
import { getSalary, createSalary, deleteSalary } from "../controller/salary.controller.js";

const router = express.Router();

router.get("/getsalary", getSalary);
router.post("/addandupdatesalary", createSalary);
router.delete("/deletesalary/:id", deleteSalary);

export default router;
