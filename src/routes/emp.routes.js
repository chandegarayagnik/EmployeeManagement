import { Router } from "express";
import { getEmp, createEmp, deleteEmp } from "../controller/emp.controller.js";
import authMiddleware from "../middleware/auth.middleware.js"
import { validate } from "../middleware/validate.js";
import { createEmpSchema, deleteEmpSchema } from "../validation/emp.validation.js";

const router = Router()

router.get("/getemp", getEmp)

router.post("/AddEmp/:Master", authMiddleware, validate(createEmpSchema), createEmp)

// router.put("/empupdate/:id", async (req, res) => {
//     const { name, position, salary } = req.body
//     try {
//         const id = req.params.id
//         await sql.query`update emp set name=${name}, position=${position}, salary=${salary} where id=${id}`;
//         res.status(200).json({ message: "Employee Data is Updated" })
//     } catch (error) {
//         res.status(500).json({ message: error.message })
//     }
// })

router.delete("/empdelete/:empukid", validate(deleteEmpSchema), deleteEmp) 

export default router