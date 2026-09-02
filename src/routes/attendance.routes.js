import express from "express";
import { getAttendance, listAttendanceById, createAttendance, deleteAttendance } from "../controller/attendance.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { attachDatabase } from "../middleware/db.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

router.get("/getattendance", authenticateJWT, attachDatabase, getAttendance);
router.get("/getbyid/:id", authenticateJWT, attachDatabase, listAttendanceById);
router.post("/addandupdateattendance", authenticateJWT, attachDatabase, upload, createAttendance);
router.delete("/deleteattendance/:id", authenticateJWT, attachDatabase, deleteAttendance);

export default router;
