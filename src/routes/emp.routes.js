import { Router } from "express";
import { getEmp, listEmpById, getEmpPhoto, createEmp, updateEmp, deleteEmp } from "../controller/emp.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { attachDatabase } from "../middleware/db.middleware.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/multer.middleware.js";
import { deleteEmpSchema } from "../validation/emp.validation.js";

const router = Router();

router.get("/getemp", authenticateJWT, attachDatabase, getEmp);
router.get("/getbyid/:empukid", authenticateJWT, attachDatabase, listEmpById);
router.get("/getempphoto/:empukid", authenticateJWT, attachDatabase, getEmpPhoto);
router.post("/AddEmp", authenticateJWT, attachDatabase, upload, createEmp);
router.put("/update", authenticateJWT, attachDatabase, upload, updateEmp);
router.delete("/empdelete/:empukid", authenticateJWT, attachDatabase, validate(deleteEmpSchema), deleteEmp);

export default router;