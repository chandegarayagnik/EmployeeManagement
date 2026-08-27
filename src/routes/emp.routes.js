import { Router } from "express";
import { getEmp, listEmpById, getEmpPhoto, createEmp, deleteEmp } from "../controller/emp.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { attachDatabase } from "../middleware/db.middleware.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/multer.middleware.js";
import { deleteEmpSchema, createEmpSchema } from "../validation/emp.validation.js";

const router = Router();

router.get("/getemp", authenticateJWT, attachDatabase, getEmp);
router.get("/getbyempid/:Id", authenticateJWT, attachDatabase, validate(deleteEmpSchema, "params"), listEmpById);
router.get("/getempphoto/:Id", authenticateJWT, attachDatabase, validate(deleteEmpSchema, "params"), getEmpPhoto);
router.post("/AddEmp", authenticateJWT, attachDatabase, upload, validate(createEmpSchema), createEmp);
router.delete("/empdelete/:Id", authenticateJWT, attachDatabase, validate(deleteEmpSchema, "params"), deleteEmp);

export default router;