import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { createDepartmentSchema, deleteDepartmentShema } from "../validation/depart.validation.js";
import { getdepartment, createdepartment, deletedepartment } from "../controller/depart.controller.js";

const router = Router()

router.use("/getdepart", getdepartment) 

router.use("/AddAndUpdateDepart", validate(createDepartmentSchema), createdepartment)

router.use("/deletedepart", validate(deleteDepartmentShema), deletedepartment)

export default router