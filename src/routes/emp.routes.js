import { Router } from "express";
import { getEmp, listEmpById, getEmpPhoto, createEmp, updateEmp, deleteEmp } from "../controller/emp.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/multer.middleware.js";
import { deleteEmpSchema } from "../validation/emp.validation.js";

const router = Router();

router.use(authMiddleware);

router.get("/getemp", getEmp);
router.get("/getbyid/:empukid", listEmpById);
router.get("/getempphoto/:empukid", getEmpPhoto);
router.post("/AddEmp", upload, createEmp);
router.put("/update", upload, updateEmp);
router.delete("/empdelete/:empukid", validate(deleteEmpSchema), deleteEmp);

export default router;