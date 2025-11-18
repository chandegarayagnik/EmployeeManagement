import { Router } from "express";
import { getEmp, createEmp, deleteEmp } from "../controller/empController.js";
import authMiddleware from "../middleware/auth.middleware.js"

const router = Router()

router.get("/", (req, res) => {
    res.json({ message: "Employee Management System" })
})

router.get("/getemp", getEmp)

router.post("/empinsert", authMiddleware, createEmp)

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

router.delete("/empdelete/:empukid", deleteEmp) 

export const emprouter = router