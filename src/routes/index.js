import { Router } from "express";
import userRouter from "./user.routes.js"
import empRouter from "./emp.routes.js"
import departRouter from "./depart.routes.js"
import attendanceRouter from "./attendance.routes.js"
import salaryRouter from "./salary.routes.js"
import payrollerRouter from "./payroll.routes.js"
import salaryslipRouter from "./salarySlip.routes.js"
const router = Router()

router.use("/user", userRouter)
router.use("/emp", empRouter)
router.use("/depart", departRouter)
router.use("/attendance", attendanceRouter)
router.use("/salary", salaryRouter)
router.use("/payroll", payrollerRouter)
router.use("/salaryslip", salaryslipRouter)

export default router   