import { Router } from "express";
import { createregister, createlogin } from "../controller/user.controller.js";

const router = Router()

router.post("/register", createregister)

router.post("/login", createlogin)

export default router
