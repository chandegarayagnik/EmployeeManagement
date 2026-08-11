import { Router } from "express";
import { signup, login, listRegistration } from "../controller/auth.controller.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/registrations", listRegistration);

export default router;
