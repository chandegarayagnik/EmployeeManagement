import { Router } from "express";
import { validate } from "../middleware/validate.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { createDepartmentSchema, deleteDepartmentShema } from "../validation/depart.validation.js";
import { getdepartment, listDepartmentById, createdepartment, deletedepartment } from "../controller/depart.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/getdepart", getdepartment);
router.get("/getbyid/:DepartmentID", listDepartmentById);
router.post("/AddAndUpdateDepart", validate(createDepartmentSchema), createdepartment);
router.delete("/deletedepart/:DepartmentID", validate(deleteDepartmentShema), deletedepartment);

export default router;