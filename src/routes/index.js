import { Router } from "express";
import userRouter from "./user.routes.js"
import empRouter from "./emp.routes.js"

const router = Router()

router.use("/user", userRouter)
router.use("/emp", empRouter)

export default router