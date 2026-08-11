import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { attachDatabase } from "../middleware/db.middleware.js";
import { createDepartmentSchema, deleteDepartmentShema } from "../validation/depart.validation.js";
import { getdepartment, listDepartmentById, createdepartment, deletedepartment } from "../controller/depart.controller.js";

const router = Router();

router.get("/getdepart", authenticateJWT, attachDatabase, getdepartment);
router.get("/getbyid/:DepartmentID", authenticateJWT, attachDatabase, listDepartmentById);
router.post("/AddAndUpdateDepart", authenticateJWT, attachDatabase, validate(createDepartmentSchema), createdepartment);
router.delete("/deletedepart/:DepartmentID", authenticateJWT, attachDatabase, validate(deleteDepartmentShema), deletedepartment);

export default router;