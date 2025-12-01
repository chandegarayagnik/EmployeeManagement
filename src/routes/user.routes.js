import { Router } from "express";
import { createregister, createlogin, forgetPassword } from "../controller/user.controller.js";

const router = Router()

router.post("/register", createregister)

router.post("/login", createlogin)

router.put("/forgetpassword", forgetPassword);

// router.delete("deleteuser:UserUkId", deleteUser)

export default router
