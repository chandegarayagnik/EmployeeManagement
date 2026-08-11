import express from "express";
import { getAttendance, listAttendanceById, createAttendance, deleteAttendance } from "../controller/attendance.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/getattendance", getAttendance);
router.get("/getbyid/:id", listAttendanceById);
router.post("/addandupdateattendance", createAttendance);
router.delete("/deleteattendance/:id", deleteAttendance);

export default router;
