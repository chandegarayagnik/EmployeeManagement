import express from "express";
import { getAttendance, createAttendance, deleteAttendance } from "../controller/attendance.controller.js";

const router = express.Router();

router.get("/getattendance", getAttendance);
router.post("/addandupdateattendance", createAttendance);
router.delete("/deleteattendance/:id", deleteAttendance);

export default router;
